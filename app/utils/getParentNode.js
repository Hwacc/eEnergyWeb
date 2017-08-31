/**
 * Created by whj57 on 2017/1/4.
 */
export const getParentNode = (data)=>{
    let result = [];
    data&&data.map((i)=>{
        let pathArray = i.Path.split('/');
        if(pathArray.length>2){
            if(pathArray.length>3){
                let key = pathArray[pathArray.length-2];
                if(!data.some(item=>key==item.Id)){
                    result.push({
                        value:i.Id,
                        name:i.Name
                    })
                }
            }else {
                result.push({
                    value:i.Id,
                    name:i.Name
                })
            }
        }
    })

    return result
};
export default getParentNode
