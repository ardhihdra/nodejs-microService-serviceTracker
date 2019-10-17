import { Sequelize, Model, DataTypes } from "sequelize";

const db = new Sequelize({
  database: "ridehailing",
  username: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false
});

export class DriverPosition extends Model {};
DriverPosition.init(
  {
    rider_id: DataTypes.INTEGER,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
  },
  { modelName: 'driver_position', sequelize: db }
)

export function syncDB(): Promise<Sequelize> {
  return db.sync();
}
