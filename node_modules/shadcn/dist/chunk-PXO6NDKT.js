import {Server}from'@modelcontextprotocol/sdk/server/index.js';import {ListToolsRequestSchema,CallToolRequestSchema}from'@modelcontextprotocol/sdk/types.js';import {searchRegistries,getRegistryItems}from'@shadcn/registry';import {withRegistryContext}from'@shadcn/registry/internal/registry/context';import {RegistryError}from'@shadcn/registry/internal/registry/errors';import {SEARCHABLE_TYPES,resolveSearchRegistries,findUnknownSearchTypes}from'@shadcn/registry/internal/registry/search';import c from'dedent';import {z as z$1}from'zod';import {getPackageRunner}from'@shadcn/registry/internal/get-package-manager';import {getRegistriesConfig}from'@shadcn/registry/internal/registry/api';var A="shadcn@latest";async function f(n){return `${await getPackageRunner(process.cwd())} ${A} ${n}`}async function d(n=process.cwd()){return {registries:(await getRegistriesConfig(n,{useCache:false})).registries}}async function h(n,t){let{query:r,registries:i}=t||{},o=await f("add"),a=n.items.map(g=>{let l=[`- ${g.name}`];return g.type&&l.push(`(${g.type})`),g.description&&l.push(`- ${g.description}`),g.registry&&l.push(`[${g.registry}]`),l.push(`
  Add command: \`${o} ${g.addCommandArgument}\``),l.join(" ")}),s=`Found ${n.pagination.total} items`;r&&(s+=` matching "${r}"`),i&&i.length>0&&(s+=` in registries ${i.join(", ")}`),s+=":";let m=`Showing items ${n.pagination.offset+1}-${Math.min(n.pagination.offset+n.pagination.limit,n.pagination.total)} of ${n.pagination.total}:`,p=`${s}

${m}

${a.join(`

`)}`;return n.pagination.hasMore&&(p+=`

More items available. Use offset: ${n.pagination.offset+n.pagination.limit} to see the next page.`),p}function y(n){if(!n?.length)return null;let t=findUnknownSearchTypes(n);return t.length===0?null:`Unknown type${t.length===1?"":"s"}: ${t.join(", ")}. Valid types: ${SEARCHABLE_TYPES.join(", ")}.`}function x(n){if(!n.errors?.length)return "";let t=n.errors.map(r=>`- ${r.registry}: ${r.message}`);return `

Skipped ${n.errors.length} registr${n.errors.length===1?"y":"ies"} that failed to load:
${t.join(`
`)}`}function j(n){return n.map(t=>[`## ${t.name}`,t.description?`
${t.description}
`:"",t.type?`**Type:** ${t.type}`:"",t.files&&t.files.length>0?`**Files:** ${t.files.length} file(s)`:"",t.dependencies&&t.dependencies.length>0?`**Dependencies:** ${t.dependencies.join(", ")}`:"",t.devDependencies&&t.devDependencies.length>0?`**Dev Dependencies:** ${t.devDependencies.join(", ")}`:""].filter(Boolean).join(`
`))}function b(n,t){let r=n.map(o=>{let a=[`## Example: ${o.name}`,o.description?`
${o.description}
`:""];return o.files?.length&&o.files.forEach(s=>{s.content&&(a.push(`### Code (${s.path}):
`),a.push("```tsx"),a.push(s.content),a.push("```"));}),a.filter(Boolean).join(`
`)});return `# Usage Examples

Found ${n.length} example${n.length>1?"s":""} matching "${t}":
`+r.join(`

---

`)}var $=new Server({name:"shadcn",version:"1.0.0"},{capabilities:{logging:{},resources:{},tools:{}}});async function O(n){try{await $.sendLoggingMessage({level:"info",data:n});}catch{console.error(n);}}function u(n){return z$1.toJSONSchema(n,{target:"draft-7"})}$.setRequestHandler(ListToolsRequestSchema,async()=>({tools:[{name:"get_project_registries",description:"Get configured registry names from components.json - Returns error if no components.json exists (use init_project to create one)",inputSchema:u(z$1.object({}))},{name:"list_items_in_registries",description:"List items from registries (requires components.json - use init_project if missing)",inputSchema:u(z$1.object({registries:z$1.array(z$1.string()).optional().describe("Array of registry names to list (e.g., ['@shadcn', '@acme']). Omit to list from every registry configured in components.json."),types:z$1.array(z$1.string()).optional().describe(`Filter by item type. One of: ${SEARCHABLE_TYPES.join(", ")}.`),limit:z$1.number().optional().describe("Maximum number of items to return (defaults to 100; use 0 for no limit)"),offset:z$1.number().optional().describe("Number of items to skip for pagination")}))},{name:"search_items_in_registries",description:"Search for components in registries using fuzzy matching (requires components.json). After finding an item, use get_item_examples_from_registries to see usage examples.",inputSchema:u(z$1.object({registries:z$1.array(z$1.string()).optional().describe("Array of registry names to search (e.g., ['@shadcn', '@acme']). Omit to search every registry configured in components.json."),query:z$1.string().describe("Search query string for fuzzy matching against item names and descriptions"),types:z$1.array(z$1.string()).optional().describe(`Filter by item type. One of: ${SEARCHABLE_TYPES.join(", ")}.`),limit:z$1.number().optional().describe("Maximum number of items to return (defaults to 100; use 0 for no limit)"),offset:z$1.number().optional().describe("Number of items to skip for pagination")}))},{name:"view_items_in_registries",description:"View detailed information about specific registry items including the name, description, type and files content. For usage examples, use get_item_examples_from_registries instead.",inputSchema:u(z$1.object({items:z$1.array(z$1.string()).describe("Array of item names with registry prefix (e.g., ['@shadcn/button', '@shadcn/card'])")}))},{name:"get_item_examples_from_registries",description:"Find usage examples and demos with their complete code. Search for patterns like 'accordion-demo', 'button example', 'card-demo', etc. Returns full implementation code with dependencies.",inputSchema:u(z$1.object({registries:z$1.array(z$1.string()).optional().describe("Array of registry names to search (e.g., ['@shadcn', '@acme']). Omit to search every registry configured in components.json."),query:z$1.string().describe("Search query for examples (e.g., 'accordion-demo', 'button demo', 'card example', 'tooltip-demo', 'example-booking-form', 'example-hero'). Common patterns: '{item-name}-demo', '{item-name} example', 'example {item-name}'")}))},{name:"get_add_command_for_items",description:"Get the shadcn CLI add command for specific items in a registry. This is useful for adding one or more components to your project.",inputSchema:u(z$1.object({items:z$1.array(z$1.string()).describe("Array of items to get the add command for prefixed with the registry name (e.g., ['@shadcn/button', '@shadcn/card'])")}))},{name:"get_audit_checklist",description:"After creating new components or generating new code files, use this tool for a quick checklist to verify that everything is working as expected. Make sure to run the tool after all required steps have been completed.",inputSchema:u(z$1.object({}))}]}));$.setRequestHandler(CallToolRequestSchema,async n=>withRegistryContext(()=>z(n),{onGitHubAuthNotice:O}));async function z(n){try{if(!n.params.arguments)throw new Error("No tool arguments provided.");switch(n.params.name){case "get_project_registries":{let t=await d(process.cwd());return t?.registries?{content:[{type:"text",text:c`The following registries are configured in the current project:

                ${Object.keys(t.registries).map(r=>`- ${r}`).join(`
`)}

                You can view the items in a registry by running:
                \`${await f("view @name-of-registry")}\`

                For example: \`${await f("view @shadcn")}\` or \`${await f("view @shadcn @acme")}\` to view multiple registries.
                `}]}:{content:[{type:"text",text:c`No components.json found or no registries configured.

                To fix this:
                1. Use the \`init\` command to create a components.json file
                2. Or manually create components.json with a registries section`}]}}case "search_items_in_registries":{let r=z$1.object({registries:z$1.array(z$1.string()).optional(),query:z$1.string(),types:z$1.array(z$1.string()).optional(),limit:z$1.number().optional(),offset:z$1.number().optional()}).parse(n.params.arguments),i=y(r.types);if(i)return {content:[{type:"text",text:i}],isError:!0};let o=await d(process.cwd()),a=!r.registries?.length,s=resolveSearchRegistries(r.registries??[],o);if(s.length===0)return {content:[{type:"text",text:c`No registries are configured. Add registries to components.json (use get_project_registries to inspect) or pass them explicitly.`}]};let m=await searchRegistries(s,{query:r.query,types:r.types,limit:r.limit??100,offset:r.offset,config:o,useCache:!1,continueOnError:a}),p=x(m);return m.items.length===0?{content:[{type:"text",text:c`No items found matching "${r.query}" in registries ${s.join(", ")}, Try searching with a different query or registry.${p}`}]}:{content:[{type:"text",text:await h(m,{query:r.query,registries:s})+p}]}}case "list_items_in_registries":{let r=z$1.object({registries:z$1.array(z$1.string()).optional(),types:z$1.array(z$1.string()).optional(),limit:z$1.number().optional(),offset:z$1.number().optional(),cwd:z$1.string().optional()}).parse(n.params.arguments),i=y(r.types);if(i)return {content:[{type:"text",text:i}],isError:!0};let o=await d(process.cwd()),a=!r.registries?.length,s=resolveSearchRegistries(r.registries??[],o);if(s.length===0)return {content:[{type:"text",text:c`No registries are configured. Add registries to components.json (use get_project_registries to inspect) or pass them explicitly.`}]};let m=await searchRegistries(s,{types:r.types,limit:r.limit??100,offset:r.offset,config:o,useCache:!1,continueOnError:a}),p=x(m);return m.items.length===0?{content:[{type:"text",text:c`No items found in registries ${s.join(", ")}.${p}`}]}:{content:[{type:"text",text:await h(m,{registries:s})+p}]}}case "view_items_in_registries":{let r=z$1.object({items:z$1.array(z$1.string())}).parse(n.params.arguments),i=await getRegistryItems(r.items,{config:await d(process.cwd()),useCache:!1});if(i?.length===0)return {content:[{type:"text",text:c`No items found for: ${r.items.join(", ")}

                Make sure the item names are correct and include the registry prefix (e.g., @shadcn/button).`}]};let o=j(i);return {content:[{type:"text",text:c`Item Details:

              ${o.join(`

---

`)}`}]}}case "get_item_examples_from_registries":{let r=z$1.object({query:z$1.string(),registries:z$1.array(z$1.string()).optional()}).parse(n.params.arguments),i=await d(),o=!r.registries?.length,a=resolveSearchRegistries(r.registries??[],i);if(a.length===0)return {content:[{type:"text",text:c`No registries are configured. Add registries to components.json (use get_project_registries to inspect) or pass them explicitly.`}]};let s=await searchRegistries(a,{query:r.query,config:i,useCache:!1,continueOnError:o});if(s.items.length===0)return {content:[{type:"text",text:c`No examples found for query "${r.query}".

                Try searching with patterns like:
                - "accordion-demo" for accordion examples
                - "button demo" or "button example"
                - Component name followed by "-demo" or "example"

                You can also:
                1. Use search_items_in_registries to find all items matching your query
                2. View the main component with view_items_in_registries for inline usage documentation`}]};let m=s.items.map(g=>g.addCommandArgument),p=await getRegistryItems(m,{config:i,useCache:!1});return {content:[{type:"text",text:b(p,r.query)}]}}case "get_add_command_for_items":{let t=z$1.object({items:z$1.array(z$1.string())}).parse(n.params.arguments);return {content:[{type:"text",text:await f(`add ${t.items.join(" ")}`)}]}}case "get_audit_checklist":return {content:[{type:"text",text:c`## Component Audit Checklist

              After adding or generating components, check the following common issues:

              - [ ] Ensure imports are correct i.e named vs default imports
              - [ ] If using next/image, ensure images.remotePatterns next.config.js is configured correctly.
              - [ ] Ensure all dependencies are installed.
              - [ ] Check for linting errors or warnings
              - [ ] Check for TypeScript errors
              - [ ] Use the Playwright MCP if available.
              `}]};default:throw new Error(`Tool ${n.params.name} not found`)}}catch(t){if(t instanceof z$1.ZodError)return {content:[{type:"text",text:c`Invalid input parameters:
              ${t.issues.map(i=>`- ${i.path.join(".")}: ${i.message}`).join(`
`)}
              `}],isError:true};if(t instanceof RegistryError){let i=t.message;return t.suggestion&&(i+=`

\u{1F4A1} ${t.suggestion}`),t.context&&(i+=`

Context: ${JSON.stringify(t.context,null,2)}`),{content:[{type:"text",text:c`Error (${t.code}): ${i}`}],isError:true}}let r=t instanceof Error?t.message:String(t);return {content:[{type:"text",text:c`Error: ${r}`}],isError:true}}}export{$ as a};