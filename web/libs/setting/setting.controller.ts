import SettingModel from "@models/setting.models";

export enum ControllerMethods {
  get = "get",
  create = "create",
}

interface GetQuery extends Pick<Setting, "shop"> {}

const get = ({ query }: { query: GetQuery }) => {
  const shop = query.shop;
  return SettingModel.findOne({ shop });
};

interface CreateQuery extends Pick<Setting, "shop"> {}
interface CreateBody extends SettingBodyUpdate {}

const create = async ({
  query,
  body,
}: {
  query: CreateQuery;
  body: CreateBody;
}): Promise<Setting> => {
  const shop = query.shop;

  return await SettingModel.findOneAndUpdate({ shop }, body, {
    upsert: true,
    new: true,
  });
};

export default { get, create };
