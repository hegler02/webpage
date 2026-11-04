// Positions use the drawing coordinate system: x, plan y, elevation in metres.
export const interiorProps={
 guardhouse:[
  {id:'mug',name:'책상 위 머그컵',pos:[6.58,3.16,.800],height:.135,rotation:0,support:'study-desk'},
  {id:'clock',name:'책상 위 탁상시계',pos:[7.48,3.46,.800],height:.162,rotation:0,support:'study-desk'},
  {id:'coffee',name:'탕비실 커피메이커',pos:[4.12,3.48,.865],height:.337,rotation:0,support:'pantry-counter'}
 ],
 apartment:[
  {id:'mug',name:'거실 테이블 머그컵',pos:[6.53,1.59,.515],height:.135,rotation:0,support:'coffee-table'},
  {id:'clock',name:'침실 협탁 탁상시계',pos:[1.65,6.77,.560],height:.162,rotation:0,support:'bed-base-0'},
  {id:'coffee',name:'주방 커피메이커',pos:[5.20,3.95,.980],height:.337,rotation:0,support:'counter'}
 ]
};
export const propPlacements=id=>interiorProps[id==='apartment-02'?'apartment':'guardhouse'];
