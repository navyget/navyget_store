import mongoose from 'mongoose';

const ServiceSchema = mongoose.Schema({
  service_name: {

  },
  service_price: {

  },
  service_description: {

  },
  service_category: {

  },
  service_subcategory: {

  },
  service_attributes: [{
    attribute_name: {

    },
    attribute_value: {

    },
  }],
  created_at: {

  },
  updated_at: {

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
ServiceSchema.pre('save', function (next) {
  const service = this;
  const currentDate = new Date();
  service.updated_at = currentDate;
  next();
});

// update update_at on update

/* eslint-disable-next-line */
ServiceSchema.pre('findOneAndUpdate', function (next) {
  const service = this;
  service.update({}, { $set: { updated_at: new Date() } });
  next();
});

const Services = mongoose.model('Services', ServiceSchema);

module.exports = { Services };
