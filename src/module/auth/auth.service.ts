import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateUser, ILoginUser, IUpdateUserPayload, IVerifyEmail } from "./auth.interface";
import httpStatus from "http-status";
import config from "../../config";
import crypto from "crypto";
import path from "path";
import ejs from "ejs";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodeMailer";
import { SignOptions } from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";

const createUserIntoDB = async (payload: ICreateUser) => {
  const { name, email, phone, city, password, role } = payload;
  const isExist = await prisma.user.findUnique({
    where: {
      email, 
    },
  });
  if (isExist) {
    throw new AppError(httpStatus.CONFLICT, "user already exist");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bycrypt_salt_rounds),
  );

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpKey = `user-verification-otp:${email}`;
  await redisClient.set(otpKey, otp, {
    expiration: {
      type: "EX",
      value: 5 * 60,
    },
  });

  const userRegistrationKey = `user-registration:${email}`;
  const redisUserDataPayload = {
    name,
    email,
    phone,
    city,
    role,
    password: hashedPassword,
  };
  await redisClient.set(
    userRegistrationKey,
    JSON.stringify(redisUserDataPayload),
    {
      expiration: {
        type: "EX",
        value: 5 * 60,
      },
    },
  );
  const templatePath = path.join(
    process.cwd(),
    "src/template/registration-otp.ejs",
  );
  const html = await ejs.renderFile(templatePath, { otp });

  await transporter.sendMail({
    from: config.smtp_user,
    to: email,
    subject: "Email Verification Otp",
    html,
  });
};

const verifyEmail = async (payload: IVerifyEmail) => {
  const email = payload.email;
  const otp = payload.otp;
  const otpKey = `user-verification-otp:${email}`;
  const redisOtp = await redisClient.get(otpKey);
  if (!redisOtp) {
    throw new AppError(httpStatus.NOT_FOUND, "otp not found");
  }
  if (redisOtp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, "invalid otp");
  }
  await redisClient.del(otpKey);

  const userRegistrationKey = `user-registration:${email}`;
  const redisUserData = await redisClient.get(userRegistrationKey);
  if (!redisUserData) {
    throw new AppError(httpStatus.NOT_FOUND, "user data not found");
  }

  await redisClient.del(userRegistrationKey);
  const userPayload: ICreateUser = JSON.parse(redisUserData);
  const createdUser = await prisma.user.create({
    data: {
      name: userPayload.name,
      email: userPayload.email,
      phone: userPayload.phone,
      city: userPayload.city,
      role: userPayload.role,
      password: userPayload.password,
      isEmailVerified: true,
    },
    omit: {
      password: true,
    },
  });

  await redisClient.del(otpKey);
  await redisClient.del(userRegistrationKey);

  const jwtPayload = {
    id: createdUser.id,
    name: createdUser.name,
    phone: createdUser.phone,
    city: createdUser.city,
    email: createdUser.email,
    role: createdUser.role,
    isEmailVerified: createdUser.isEmailVerified,
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }

  if (user.isDeleted === true) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "user account has been deleted, please contact support",
    );
  }
  if (user.isEmailVerified === false) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "user is not verified, please verify your email",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "password not matched");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      donorProfile: true,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

const updateUser = async (payload: IUpdateUserPayload, userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }
  if (user.isDeleted ===  true) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "user is deleted, please contact support",
    );
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    include: {
      donorProfile: true,
    },
    omit: {
      password: true,
    },
    data: {
      ...payload,
    },
  });
  return updatedUser;
};

export const authService = {
    createUserIntoDB,
    verifyEmail,
    loginUser,
    getMyProfile,
    updateUser,
};