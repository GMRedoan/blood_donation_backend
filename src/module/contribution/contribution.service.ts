import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { Stripe } from "stripe";

const createContribution = async (
  campaignId: string,
  amount: number,
  userId: string,
) => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, "campaign not found");
  }

  if (campaign.deletedAt) {
    throw new AppError(httpStatus.BAD_REQUEST, "Campaign has been deleted");
  }

  if (campaign.status !== "ACTIVE") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "contribution can only be made for active campaigns",
    );
  }
  if (amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Contribution amount must be greater than 0",
    );
  }
  const remainingAmount = campaign.targetAmount - campaign.raisedAmount;

  if (remainingAmount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This campaign has already reached its target",
    );
  }

  if (amount > remainingAmount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Maximum contribution allowed is ${remainingAmount}`,
    );
  }

  const payment = await prisma.contribution.create({
    data: {
      campaignId,
      contributorId: userId,
      amount: amount,
      status: "PENDING",
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: campaign.title,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${config.app_url}/campaign?success=true`,
    cancel_url: `${config.app_url}/campaign?success=false`,
    metadata: {
      contributionId: payment.id,
      campaignId,
      userId,
    },
  });

  await prisma.contribution.update({
    where: {
      id: payment.id,
    },
    data: {
      stripeCheckoutSessionId: session.id,
    },
  });

  return {
    contributionId: payment.id,
    checkoutUrl: session.url,
  };
};

const confirmContribution = async (rawBody: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret as string,
    );
  } catch (err) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `webhook signature verification failed: ${err}`,
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const payment = await prisma.contribution.findUnique({
      where: { 
        stripeCheckoutSessionId: session.id
     },
    });

    if (!payment) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "payment record not found for this session",
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
         id: payment.campaignId
         },
    });

    if (!campaign) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "campaign not found for this payment",
      );
    }

    await prisma.$transaction([
      prisma.contribution.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
        },
      }),

      prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          raisedAmount: {
            increment: payment.amount,
          },
        },
      }),
    ]);
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    await prisma.contribution.updateMany({
      where: { stripeCheckoutSessionId: session.id },
      data: { status: "FAILED" },
    });
  }

  return { 
    received: true
  };
};

const contributionHistory = async () => {
    const contributions = await prisma.contribution.findMany({
      where: {
        status: "SUCCEEDED",
      },
      include: {
        campaign: true,
        contributor: true,
      },
    });
  
    return contributions;
};

const myContributionHistory = async (userId: string) => {
    const contributions = await prisma.contribution.findMany({
      where: {
        contributorId: userId,
        status: "SUCCEEDED",
      },
      include: {
        campaign: true,
      },
    });
  
    return contributions;
  };

export const contributionService = {
  createContribution,
  confirmContribution,
  contributionHistory,
  myContributionHistory
};
