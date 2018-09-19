import express from 'express';
import { ObjectID } from 'mongodb';
import Stores from '../models/stores';
import Items from '../models/items';
import Services from '../models/services';
import decode from '../middleware/decode';

const _ = require('lodash');

const router = express.Router();

/* eslint no-underscore-dangle: ["error", { "allow": ["_id", "_storeAdmin"] }] */

// create a store (private)
router.post('/store', (req, res) => {
  const token = req.get('x-auth');
  const user = decode(token);
  if (!user) {
    return res.status(401).send({
      message: 'unauthorized parameters',
    });
  }
  const storeBody = _.pick(req.body, ['store_name', 'store_type', 'store_category', 'location', '_storeAdmin']);
  if (user._id !== storeBody._storeAdmin || user.accountType !== 'business account') {
    return res.status(401).send({
      message: 'unauthorized parameters',
    });
  }
  const store = new Stores(storeBody);
  store.save().then((shop) => {
    res.status(200).send({
      shop,
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// can view a particular store profile (public)
router.get('/:storeId', (req, res) => {
  const { storeId } = req.params;
  if (!ObjectID.isValid(storeId)) {
    return res.status(404).send();
  }
  return Stores.findById(storeId).then((store) => {
    if (!store) {
      return res.status(404).send();
    }
    return res.send({ store });
  }, (e) => {
    res.send(e);
  });
});

// can view my store profile (private) (not)
router.get('/myStore/view', (req, res) => {
  const token = req.get('x-auth');
  const user = decode(token);
  const userId = user._id;
  if (user.account !== 'business account') {
    return res.status().send({
      message: 'Unauthorized account.',
    });
  }
  return Stores.findOne({ _storeAdmin: userId }).then((store) => {
    if (!store) {
      return res.status(404).send({
        message: 'Store does not exist',
      });
    }
    return res.send({ store });
  }, (e) => {
    res.status(400).send(e);
  });
});

// can delete store profile (private)
router.delete('/:storeId', authenticate, (req, res) => {
  const { storeId } = req.params;
  if (!ObjectID.isValid(storeId)) {
    return res.status(404).send({
      message: 'Invalid Store Id',
    });
  }
  if (req.account !== 'business account') {
    return res.status().send({
      message: 'Unauthorized account',
    });
  }
  Stores.findByIdAndRemove(storeId).then((store) => {
    if (!store) {
      return res.status(404).send({
        message: 'Store does not exist',
      });
    }
    res.send({
      store,
      message: 'store has bee deleted',
    });
  }, (e) => {
    res.status.send(e);
  });
});

// can edit store profile (private)
router.patch('/:storeId', authenticate, (req, res) => {
  const { storeId } = req.params.storeId;
  const body = _.pick(req.body, ['store_name', 'store_type', 'store_category', 'location']);
  if (!ObjectID.isValid(storeId)) {
    return res.status(404).send({
      message: 'Invalid Store Id',
    });
  }
  if (req.account !== 'business account') {
    return res.status().send({
      message: 'Unauthorized account',
    });
  }
  Stores.findByIdAndUpdate(storeId, { $set: body }, { new: true }).then((store) => {
    if (!store) {
      return res.status(404).send({
        message: 'Store does not exist',
      });
    }
    res.send({
      store,
      message: 'Store has been updated',
    });
  }, (e) => {
    res.status(400).send(e);
  });
});

// create an item (private)
router.post('/:storeId/item/create', authenticate, (req, res) => {
  const { storeId } = req.params;
  const storeAdmin = req.user._id;
  const body = _.pick(req.body, ['item_name', 'item_price', 'item_description', 'item_description', 'item_category', 'item_subcategory', 'item_attributes']);

  if (!ObjectID.isValid(storeId)) {
    return res.status(404).send();
  }

  if (req.account !== 'business account') {
    return res.status().send({
      message: 'Unauthorized account.',
    });
  }

  Stores.findOne({ _id: storeId }).then((store) => {
    if (!store) {
      return res.status(404).send({
        message: 'Sorry. Store does not exist',
      });
    }

    Items.findOne({ item_name: body.item_name }).then((duplicate) => {
      if (duplicate) {
        return Promise.reject(new Error({
          message: 'Sorry. Item already exists',
        }));
      }
    }).then(() => {
      const itemBody = Object.assign({}, body, { _storeId: storeId }, { _storeAdmin: storeAdmin });

      const item = new Items(itemBody);
      item.save().then(() => {
        res.send({
          item,
          message: 'you have successfully created the item',
        });
      });
    }).catch((e) => {
      res.status(400).send(e);
    });
  });
});

// view an  item (public)
router.get('/:storeId/item/:itemId', (req, res) => {
  const { storeId } = req.params;
  const { itemId } = req.params;

  if (!ObjectID.isValid(storeId) || !ObjectID.isValid(itemId)) {
    return res.status(404).send();
  }

  Items.findOne({ _storeId: storeId, _id: itemId }).then((item) => {
    if (!item) {
      return res.status(404).send({
        message: 'Sorry Item does not exist',
      });
    }
    res.send(item);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// update a item (private)business account
router.patch('/:storeId/item/:itemId', authenticate, (req, res) => {
  const { storeId } = req.params;
  const { itemId } = req.params;
  const storeAdmin = req.user._id;
  const body = _.pick(req.body, ['item_name', 'item_price', 'item_description', 'item_category', 'item_subcategory', 'item_attributes']);

  if (req.account !== 'business account') {
    return res.status(400).send({
      message: 'Unauthorized account.',
    });
  }

  if (!ObjectID.isValid(storeId) || !ObjectID.isValid(itemId)) {
    return res.status(404).send();
  }

  Items.findOneAndUpdate({
    _storeId: storeId,
    _id: itemId,
    _storeAdmin: storeAdmin,
  },
  { $set: body },
  { new: true }).then((item) => {
    if (!item) {
      return res.status(404).send({
        message: 'Item does not exist',
      });
    }
    res.send({
      item,
      message: 'Item has been updated',
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// delete a item (private)
router.delete('/:storeId/item/:itemId', authenticate, (req, res) => {
  const { storeId } = req.params;
  const { itemId } = req.params;
  const storeAdmin = req.user._id;

  if (req.account !== 'business account') {
    return res.status(400).send({
      message: 'Unauthorized account.',
    });
  }

  if (!ObjectID.isValid(storeId) || !ObjectID.isValid(itemId)) {
    return res.status(404).send();
  }

  Items.findOneAndRemove({
    _storeId: storeId,
    _id: itemId,
    _storeAdmin: storeAdmin,
  }).then((item) => {
    if (!item) {
      return res.status(404).send({
        message: 'Item does not exist',
      });
    }
    res.send({
      item,
      message: 'Item has been deleted',
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// view all items in a store (public)
router.get('/:storeId/items', (req, res) => {
  const { storeId } = req.params;
  if (!ObjectID.isValid(storeId)) {
    return res.status(404).send();
  }

  Items.find({ _storeId: storeId }).then((items) =>{
    if (!items) {
      return res.status(404).send({
        message: 'Items does not exist',
      });
    }
    res.send(items);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// create a service (private)
router.post('/:storeId/service/create', authenticate, (req, res) => {
  const { storeId } = req.params.storeId;
  const storeAdmin = req.user._id;
  const body = _.pick(req.body, ['service_name', 'service_price', 'service_description', 'service_category', 'service_subcategory', 'service_attributes']);

  if (!ObjectID.isValid(storeId)) {
    return res.status(404).send();
  }

  if (req.account !== 'business account') {
    return res.status(400).send({
      message: 'Unauthorized account.',
    });
  }

  Stores.findOne({ _id: storeId }).then((store) => {
    if (!store) {
      return res.status(404).send({
        message: 'Sorry. Store does not exist',
      });
    }

    Services.findOne({ service_name: body.service_name }).then((duplicate) => {
      if (duplicate) {
        return Promise.reject(new Error({
          message: 'Sorry. Service already already exists.',
        }));
      }
    }).then(() => {
      const serviceBody = Object.assign({}, body, { _storeId: storeId },
        { _storeAdmin: storeAdmin });

      const service = new Services(serviceBody);
      service.save().then(() => {
        res.send({
          service,
          message: 'you have successfully created the service',
        });
      });
    }).catch((e) => {
      res.status(400).send(e);
    });
  });
});

// view a service (public)
router.get('/:storeId/service/:serviceId', (req, res) => {
  const { storeId } = req.params;
  const { serviceId } = req.params;

  if (!ObjectID.isValid(storeId) || !ObjectID.isValid(serviceId)) {
    return res.status(404).send();
  }

  Services.findOne({ _storeId: storeId, _id: serviceId }).then((service) => {
    if (!service) {
      return res.status(404).send({
        message: 'Sorry. That Service does not exist',
      });
    }
    res.send(service);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// update a service (private)
router.patch('/:storeId/service/:serviceId', authenticate, (req, res) => {
  const { storeId } = req.params;
  const { serviceId } = req.params;
  const storeAdmin = req.user._id;
  const body = _.pick(req.body, ['service_name', 'service_price', 'service_description', 'service_category', 'service_subcategory', 'service_attributes']);

  if (!ObjectID.isValid(storeId) || !ObjectID.isValid(serviceId)) {
    return res.status(404).send();
  }

  if (req.account !== 'business account') {
    return res.status().send({
      message: 'Unauthorized account.',
    });
  }

  Services.findOneAndUpdate({
    _storeId: storeId,
    _id: serviceId,
    _storeAdmin: storeAdmin,
  },
  { $set: body },
  { new: true }).then((service) => {
    if (!service) {
      return res.status(404).send({
        message: 'Sorry. Service does not exist',
      });
    }
    res.send({
      service,
      message: 'Service has been updated',
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// delete a service (private)
router.delete('/:storeId/service/:serviceId', authenticate, (req, res) => {
  const { storeId } = req.params;
  const { serviceId } = req.params;
  const storeAdmin = req.user._id;

  if (!ObjectID.isValid(storeId) || !ObjectID.isValid(serviceId)) {
    return res.status(404).send();
  }

  if (req.account !== 'business account') {
    return res.status().send({
      message: 'Unauthorized account.',
    });
  }

  Services.findOneAndRemove({
    _storeId: storeId,
    _id: serviceId,
    _storeAdmin: storeAdmin,
  }).then((service) => {
    if (!service) {
      return res.status(404).send({
        message: 'Service does not exist',
      });
    }
    res.send({
      service,
      message: 'Service has been deleted',
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// view all services in a store (public)
router.get('/:storeId/services', (req, res) => {
  const { storeId } = req.params;
  if (!ObjectID.isValid(storeId)) {
    return res.status(404).send();
  }

  Services.find({ _storeId: storeId }).then((services) =>{
    if (!services) {
      return res.status(404).send({
        message: 'Services does not exist',
      });
    }
    res.send(services);
  }).catch((e) => {
    res.status(400).send(e);
  });
});

export default router;
