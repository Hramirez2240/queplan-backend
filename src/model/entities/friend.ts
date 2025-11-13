import { Column, DataType, PrimaryKey, Table, Model } from "sequelize-typescript";

@Table({ tableName: "my_friends", timestamps: false })
export class Friend extends Model {
    @PrimaryKey
    @Column({ type: DataType.UUID, allowNull: false })
    declare id: string;

    @Column({type: DataType.STRING, allowNull: false})
    declare name: string;

    @Column({type: DataType.STRING, allowNull: false})
    declare gender: string;
}