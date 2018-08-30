import mongoose from 'mongoose';

const ItemSchema = mongoose.Schema({
  item_name: {
    type: String,
    required: true,
    trim: true,
  },
  item_price: {
    type: Number,
    required: true,
  },
  item_description: {
    type: String,
    required: true,
    trim: true,
  },
  item_category: {
    type: String,
    required: true,
  },
  item_subcategory: {
    type: String,
    required: true,
  },
  item_attributes: [{
    attribute_name: {
      type: String,
      required: true,
    },
    attribute_value: {
      type: String,
      required: true,
    },
  }],
  availability: {
    type: Boolean,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
  _storeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Stores',
  },
  _storeAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

// update update_at on creation

/* eslint-disable-next-line */
ItemSchema.pre('save', function (next) {
  const item = this;
  const currentDate = new Date();
  item.updated_at = currentDate;
  next();
});

// update update_at on update

/* eslint-disable-next-line */
ItemSchema.pre('findOneAndUpdate', function (next) {
  const item = this;
  item.update({}, { $set: { updated_at: new Date() } });
  next();
});

const Items = mongoose.model('Items', ItemSchema);

module.exports = { Items };
