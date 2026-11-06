// KS D 3504 nominal values. D10 is a designation; its nominal diameter is not 10 mm.
export const rebarSizes=Object.freeze({
 10:Object.freeze({nominal:9.53,area:71.33,massPerMeter:.56}),
 13:Object.freeze({nominal:12.7,area:126.7,massPerMeter:.995})
});
export function rebarSize(designation){
 const size=rebarSizes[designation];
 if(!size)throw new Error('등록되지 않은 철근 호칭입니다: D'+designation);
 return size;
}
