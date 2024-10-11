import { AVListComponent } from './AVList'
import { getAVListIdByLanguageId, getAVListByAVId } from "@/data/fetchPrisma";
import { List_AV_Type } from "@/types/types";

const AVListCompo = async ({ languageId }: { languageId: number }) => {
    const avIdlist = await getAVListIdByLanguageId(languageId);
    if (!avIdlist) {
        return [];
    }
    const avLists = await Promise.all(avIdlist.map(async (object) => {
        const avlist = await getAVListByAVId(object.listav_id);
        return avlist as unknown as List_AV_Type[];
    }));
    return avLists.flat();
}

const AVListByLanguage = async () => {
    const CHNItem = await AVListCompo({ languageId: 1 });
    const JPNItem = await AVListCompo({ languageId: 2 });
    const KRNItem = await AVListCompo({ languageId: 3 });
    const NONCJKItem = await AVListCompo({ languageId: 4 });

    return (
        <AVListComponent
            CHNItem={CHNItem}
            JPNItem={JPNItem}
            KRNItem={KRNItem}
            NONCJKItem={NONCJKItem} />
    );
}

export default AVListByLanguage;
