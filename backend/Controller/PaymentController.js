const razorpay = require('../Config/razorpay');
const Payment = require('../Modules/Payment');
const User = require('../Modules/User');

exports.createPremiumOrder = async (req, res) => {
    try {
        const userId = req.user._id;

        // Premium price for MVP
        const amount = 49900; // ₹499 in paise

        const user = await require('../Modules/User').findById(req.user._id);

if (!user) {
    return res.status(404).json({
        message: 'User not found'
    });
}

if (user.role !== 'mentor') {
    return res.status(403).json({
        message: 'Only mentors can purchase premium'
    });
}

if (!user.premiumEligible) {
    return res.status(403).json({
        message: 'You are not eligible for premium'
    });
}
const existingPayment = await Payment.findOne({
    userId,
    type: 'premium',
    status: {
        $in: ['created', 'pending', 'paid']
    }
});

if (existingPayment) {
    return res.status(409).json({
        message: 'You already have an active premium payment/order'
    });
}

        const options = {
            amount,
            currency: 'INR',
            receipt: `premium_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        const payment = await Payment.create({
            userId,
            orderId: order.id,
            amount,
            currency: 'INR',
            type: 'premium',
            status: 'created'
        });

        res.status(201).json({
            message: 'Premium order created successfully',
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            paymentId: payment._id
        });

    } catch (err) {
        console.error('Create premium order error:', err);

        res.status(500).json({
            message: 'Unable to create payment order'
        });
    }
};

const crypto = require('crypto');

exports.verifyPremiumPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: 'Payment verification details are required'
            });
        }

        const payment = await Payment.findOne({
            orderId: razorpay_order_id,
            userId: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                message: 'Payment order not found'
            });
        }

        if (payment.status === 'paid' && payment.verified) {
            return res.status(200).json({
                message: 'Payment already verified'
            });
        }

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            payment.status = 'failed';
            await payment.save();

            return res.status(400).json({
                message: 'Invalid payment signature'
            });
        }

        payment.paymentId = razorpay_payment_id;
        payment.status = 'paid';
        payment.verified = true;

        await payment.save();

        

const user = await User.findById(req.user._id);

if (
    user &&
    user.role === 'mentor' &&
    user.premiumEligible === true
) {
    user.premiumEnabled = true;
    await user.save();
}

        res.status(200).json({
            message: 'Payment verified successfully',
            paymentId: payment._id
        });

    } catch (err) {
        console.error('Payment verification error:', err);

        res.status(500).json({
            message: 'Payment verification failed'
        });
    }
};

exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        const signature = req.headers['x-razorpay-signature'];

        if (!signature) {
            return res.status(400).json({
                message: 'Webhook signature missing'
            });
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({
                message: 'Invalid webhook signature'
            });
        }

        const event = JSON.parse(req.body.toString());

        if (event.event === 'payment.captured') {
            const paymentEntity = event.payload.payment.entity;

            const payment = await Payment.findOne({
                orderId: paymentEntity.order_id
            });

            if (payment) {
                payment.paymentId = paymentEntity.id;
                payment.status = 'paid';
                payment.verified = true;

                await payment.save();

                


                const user = await User.findById(req.user._id);
                
                if (
                    user &&
                    user.role === 'mentor' &&
                    user.premiumEligible === true
                ) {
                    user.premiumEnabled = true;
                    await user.save();
                }
            }
        }

        res.status(200).json({
            received: true
        });

    } catch (err) {
        console.error('Razorpay webhook error:', err);

        res.status(500).json({
            message: 'Webhook processing failed'
        });
    }
};