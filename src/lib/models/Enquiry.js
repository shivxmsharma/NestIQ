import mongoose from 'mongoose';

const EnquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },

    // renamed from sender → buyer, receiver → owner for clarity
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // contact info (pre-filled from session but stored on the enquiry)
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },

    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },

    // 'general' | 'visit' | 'offer'
    enquiryType: {
      type: String,
      enum: ['general', 'visit', 'offer'],
      default: 'general',
    },

    // 'pending' | 'responded' | 'closed' | 'spam'
    status: {
      type: String,
      enum: ['pending', 'responded', 'closed', 'spam'],
      default: 'pending',
    },

    // owner's reply (replaces separate reply model)
    ownerResponse: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response cannot exceed 1000 characters'],
    },

    // whether the owner has read this enquiry
    isRead: { type: Boolean, default: false },

    // visit scheduling
    visitDate: { type: Date },
    visitTime: { type: String, trim: true },   // e.g. "3:00 PM"
    visitStatus: {
      type: String,
      enum: ['requested', 'confirmed', 'cancelled', 'completed'],
    },

    // broker lead assignment (kept from original)
    isLeadAssigned: { type: Boolean, default: false },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // internal notes (kept from original — useful for brokers)
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// indexes from original + new ones needed for dashboard queries
EnquirySchema.index({ property: 1 });
EnquirySchema.index({ buyer: 1 });
EnquirySchema.index({ owner: 1 });
EnquirySchema.index({ owner: 1, isRead: 1 });   // unread count query
EnquirySchema.index({ buyer: 1, enquiryType: 1 }); // visits query

export default mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);