import { Sequelize, Model, DataTypes } from "sequelize";

export const db = new Sequelize({
  database: "ridehailing",
  username: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false
});

export class DriverPoint extends Model { };
DriverPoint.init(
  {
    rider_id: DataTypes.INTEGER,
    point: DataTypes.INTEGER
  },
  { modelName: 'driver_point', sequelize: db }
)

export function syncDB(): Promise<Sequelize> {
  return db.sync();
}
