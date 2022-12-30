import ProductModel from "@models/product.model";
import ScheduleModel from "@models/schedule.model";
import ProductService from "@services/product.service";
import Shopify from "@shopify/shopify-api";
import { Session } from "@shopify/shopify-api";
import mongoose from "mongoose";
import shopify from "../../shopify";

export enum ControllerMethods {
  get = "get",
  getById = "getById",
  getOrderFromShopify = "getOrderFromShopify",
  update = "update",
  getStaff = "getStaff",
  getStaffToAdd = "getStaffToAdd",
  addStaff = "addStaff",
  removeStaff = "removeStaff",
}

interface GetOrderFromShopify {
  query: {
    session: Session;
    id: string;
  };
}

interface ClientQueryShopifyOrder {
  body: {
    data: {
      order: {
        name: string;
      };
    };
  };
}

const getOrderFromShopify = async ({
  query: { session, id },
}: GetOrderFromShopify) => {
  const client = new shopify.api.clients.Graphql({ ...session } as any);
  const data: ClientQueryShopifyOrder = await client.query({
    data: `query {
      order(id: "gid://shopify/Order/${id}") {
        name,
        note,
      }
    }`,
  });

  return data?.body?.data?.order;
};

interface GetQuery {
  shop: string;
}

const get = ({ query }: { query: GetQuery }) => {
  return ProductModel.find({ shop: query.shop });
};

interface Query {
  shop: string;
  id: string;
}

const getById = async ({
  query,
}: {
  query: Query;
}): Promise<Product | null> => {
  const { shop, id } = query;

  const product = await ProductModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    shop,
    "staff.0": { $exists: false },
  });

  if (product) {
    return product as any;
  }

  const products = await ProductModel.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id), shop },
    },
    {
      $unwind: { path: "$staff", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "Staff",
        localField: "staff.staff",
        foreignField: "_id",
        as: "staff.staff",
      },
    },
    {
      $unwind: {
        path: "$staff.staff",
      },
    },
    {
      $addFields: {
        "staff.staff.tag": "$staff.tag",
      },
    },
    {
      $addFields: {
        staff: "$staff.staff",
      },
    },
    { $sort: { "staff.fullname": 1 } },
    {
      $group: {
        _id: "$_id",
        product: { $first: "$$ROOT" },
        staff: { $push: "$staff" },
      },
    },
    {
      $addFields: {
        "product.staff": "$staff",
      },
    },
    { $replaceRoot: { newRoot: "$product" } },
  ]);

  return products.length > 0 ? products[0] : null;
};

const update = ({
  query,
  body,
}: {
  query: Query;
  body: ProductUpdateBody;
}): Promise<Product> => {
  return ProductService.update({ query, body });
};

// @description return all staff that don't belong yet to the product
const getStaff = ({ query }: { query: Query }) => {
  const { shop } = query;

  return ScheduleModel.aggregate<ProductAddStaff>([
    /*{
      //TODO: should we only show staff who have schedule after today?
      $match: {
        start: {
          $gte: startOfDay(new Date()),
        },
      },
    },*/
    {
      $group: {
        _id: {
          shop: shop,
          staff: "$staff",
          tag: "$tag",
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ staff: "$_id.staff", tag: "$_id.tag" }],
        },
      },
    },
    {
      $group: {
        _id: "$staff",
        tags: { $push: "$tag" },
      },
    },
    {
      $project: {
        _id: "$_id",
        tags: "$tags",
      },
    },
    {
      $lookup: {
        from: "Staff",
        localField: "_id",
        foreignField: "_id",
        as: "staffs",
      },
    },
    {
      $unwind: "$staffs", //explode array
    },
    {
      $addFields: {
        "staffs.tags": "$tags",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$staffs",
      },
    },
    { $sort: { fullname: 1 } },
  ]);
};

export default {
  get,
  getById,
  getOrderFromShopify,
  update,
  getStaff,
};
