// Интерфейс для тарифа для коробов по складу 
export interface WarehouseEx {
    boxDeliveryAndStorageExpr: string;
    boxDeliveryBase: string;
    boxDeliveryLiter: string;
    boxStorageBase: string;
    boxStorageLiter: string;
    warehouseName: string;
}
// Интерфейс для набора тарифов для коробов, сгрупированных по складам
export interface ResponseData {
    dtNextBox:string;
    dtTillMax:string;
    warehouseList: Array<WarehouseEx>;
} 