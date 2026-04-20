import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "NestIQ",
    },
    supportEmail: {
      type: String,
      default: "support@nestiq.com",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    autoApproveProperties: {
      type: Boolean,
      default: false,
    },
    commissionFeePercentage: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 100,
    },
    maxPropertiesPerUser: {
      type: Number,
      default: 10,
      min: 1,
    }
  },
  { timestamps: true }
);

// We will only need one document per database to store these global settings.
// We can fetch it by looking for any document since it's a singleton.
const PlatformSettings =
  mongoose.models.PlatformSettings ||
  mongoose.model("PlatformSettings", platformSettingsSchema);

export default PlatformSettings;
