import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateUser } from "./auth.interface";
import httpStatus from "http-status";
import config from "../../config";
import crypto from "crypto";
import path from "path";
import ejs from "ejs";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodeMailer";

const createUserIntoDB = async (payload: ICreateUser) => {
  const { name, email, phone, password, role } = payload;
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
    role: role,
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

export const authService = {
  createUserIntoDB,
};