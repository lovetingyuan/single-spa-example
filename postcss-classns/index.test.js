const postcss = require('postcss')

const plugin = require('./')
postcss([plugin({
  namespaceClass: '.tingyuan'
})]).process(`

.a, [sdfds], #fdsnf, .dfsd .sdf {
  font-size: 13px;
  color: red;
}
:root {
  
}
.b > p ~ .foo #fdsf {
  .c { /* classns-ignore */

  }
  .d {

  }
}
:root {}
`, { from: undefined }).then((ret) => {
  console.log(ret.css)
}).catch(err => {
  console.error(err)
})

// async function run (input, output, opts = { }) {
//   let result = await postcss([plugin(opts)]).process(input, { from: undefined })
//   expect(result.css).toEqual(output)
//   expect(result.warnings()).toHaveLength(0)
// }

/* Write tests here

it('does something', async () => {
  await run('a{ }', 'a{ }', { })
})

*/
