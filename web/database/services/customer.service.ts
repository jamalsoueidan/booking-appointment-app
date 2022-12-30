import CustomerModel from "@models/customer.model";
import ShopifySessions from "@models/shopify-sessions.model";
import Shopify from "@shopify/shopify-api";
import shopify from "../../shopify";

const getCustomerQuery = `
  query($id: ID!) {
    customer(id: $id) {
      firstName
      lastName
      email
      phone
    }
  }
`;

interface FindCustomerAndUpdateProps {
  shop: string;
  customerGraphqlApiId: string;
  customerId: number;
}

const findCustomerAndUpdate = async ({
  shop,
  customerGraphqlApiId,
  customerId,
}: FindCustomerAndUpdateProps) => {
  // customer saving
  const session = await ShopifySessions.findOne({ shop: shop });

  const client = new shopify.api.clients.Graphql({ session } as any);
  const customerData: any = await client.query({
    data: {
      query: getCustomerQuery,
      variables: {
        id: customerGraphqlApiId,
      },
    },
  });

  return await CustomerModel.findOneAndUpdate(
    { customerId, shop },
    {
      customerId,
      shop,
      ...customerData.body.data.customer,
    },
    { upsert: true, new: true }
  );
};

interface FindCustomerProps {
  shop: string;
  name: string;
}

const findCustomer = ({ shop, name }: FindCustomerProps) => {
  const rgx = (pattern) => new RegExp(`.*${pattern}.*`);
  const searchRgx = rgx(name);

  return CustomerModel.find(
    {
      $or: [
        { firstName: { $regex: searchRgx, $options: "i" } },
        { lastName: { $regex: searchRgx, $options: "i" } },
      ],
      shop,
    },
    "customerId firstName lastName"
  )
    .limit(10)
    .lean();
};

export default { findCustomerAndUpdate, findCustomer };
