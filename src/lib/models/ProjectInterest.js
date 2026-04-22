import mongoose from "mongoose";

const ProjectInterestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    builder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Builder",
      required: true,
    },
    // What the buyer is interested in
    interestedConfig: { type: String, default: "" },  // e.g. "3 BHK"
    budget: { type: Number },
    message: { type: String, trim: true, maxLength: 500, default: "" },
    // Contact snapshot at time of interest (in case user edits profile later)
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    // CRM status
    status: {
      type: String,
      enum: ["new", "contacted", "site_visit_scheduled", "converted", "dropped"],
      default: "new",
    },
    builderNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// One interest per buyer per project
ProjectInterestSchema.index({ project: 1, buyer: 1 }, { unique: true });
ProjectInterestSchema.index({ builder: 1 });
ProjectInterestSchema.index({ status: 1 });

const ProjectInterest =
  mongoose.models.ProjectInterest ||
  mongoose.model("ProjectInterest", ProjectInterestSchema);

export default ProjectInterest;
