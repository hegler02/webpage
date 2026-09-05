struct Field { size: vec2f, time: f32, unused: f32, color: vec4f };
@group(0) @binding(0) var<uniform> field: Field;
@vertex fn vertex(@builtin(vertex_index) index: u32)->@builtin(position) vec4f {
  let vertices=array<vec2f,3>(vec2f(-1.,-1.),vec2f(3.,-1.),vec2f(-1.,3.));
  return vec4f(vertices[index],0.,1.);
}
@fragment fn fragment(@builtin(position) p: vec4f)->@location(0) vec4f {
  let uv=p.xy/field.size;
  let origin=vec2f(.72,.48);
  let d=length((uv-origin)*vec2f(field.size.x/field.size.y,1.));
  let breath=.5+.5*sin(field.time*.45);
  let wave=pow(.5+.5*cos(d*42.-field.time*1.6),18.);
  let envelope=exp(-d*3.)*(.24+.36*breath);
  let alpha=wave*envelope;
  return vec4f(field.color.rgb*alpha,alpha);
}
