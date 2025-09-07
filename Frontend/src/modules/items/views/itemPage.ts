import { getItemForInventory } from "../../../services/itemServices";

export function ItemPage(){
    return `<div>
        <section class="item">
            <table></table>
        </section>
    </div>`;
}

export async function initItemPage(Inventoryid : number, itemId: number){
    const itemSection = document.querySelector('.item') as HTMLElement;
    const itemTable = document.createElement('table');
    itemSection.appendChild(itemTable);
    const getItem = await getItemDetails(Inventoryid, itemId);
    console.log(getItem);
}

async function getItemDetails(inventoryId: number, itemId: number) {
  try {
    const item = await getItemForInventory(inventoryId, itemId);
    return item;
  } catch (error) {
    console.error('Error fetching item details:', error);
    return null;
  }
}