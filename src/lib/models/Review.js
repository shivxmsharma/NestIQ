import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      // Optional: if the review is directly related to a specific property transaction
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    status: {
      type: String,
      enum: ["published", "hidden", "flagged"],
      default: "published",
    },
  },
  { timestamps: true }
);

// Prevent a user from reviewing the same person multiple times for the same property context
// A user can review a landlord once generally (property=null), or once per distinct property
reviewSchema.index({ reviewer: 1, reviewee: 1, property: 1 }, { unique: true });

// Pre-save hook or statics can be used to update `reviewee` Trust Score
reviewSchema.statics.calculateAverageTrustScore = async function (revieweeId) {
  const stats = await this.aggregate([
    { $match: { reviewee: new mongoose.Types.ObjectId(revieweeId), status: "published" } },
    {
      $group: {
        _id: "$reviewee",
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("User").findByIdAndUpdate(revieweeId, {
      trustScore: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].numReviews,
    });
  } else {
    await mongoose.model("User").findByIdAndUpdate(revieweeId, {
      trustScore: 0,
      reviewCount: 0,
    });
  }
};

// Hook after save
reviewSchema.post("save", function () {
  this.constructor.calculateAverageTrustScore(this.reviewee);
});

// Hook after remove
reviewSchema.post("remove", function () {
  this.constructor.calculateAverageTrustScore(this.reviewee);
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
