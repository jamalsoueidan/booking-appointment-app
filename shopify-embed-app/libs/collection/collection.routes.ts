import { Router } from "express";
import { expressHandleRoute } from "../express-helpers/handle-route";
import controller, { ControllerMethods } from "./collection.controller";
import { body } from "express-validator";

export const collectionRoutes = (app) => {
  const router = Router();

  const handleRoute = expressHandleRoute(app, controller);

  router.get("/collections", async (req, res) => {
    handleRoute(req, res, ControllerMethods.get);
  });

  router.delete("/collections/:id", async (req, res) => {
    handleRoute(req, res, ControllerMethods.remove);
  });

  router.post(
    "/collections",
    body("selections").notEmpty(),
    async (req, res) => {
      handleRoute(req, res, ControllerMethods.create);
    }
  );

  return router;
};
