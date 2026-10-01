// Article icon mappings adapted from Clarity; see THIRD_PARTY_NOTICES.md.
const mainDomainIcons: Record<string, string> = {
	'bilibili.com': 'ri:bilibili-fill',
	'creativecommons.org': 'ri:creative-commons-line',
	'feishu.cn': 'icon-park-outline:new-lark',
	'github.com': 'ri:github-fill',
	'github.io': 'ri:github-fill',
	'google.cn': 'ri:google-fill',
	'google.com': 'ri:google-fill',
	'jd.com': 'arcticons:jd-sports',
	'larkoffice.com': 'icon-park-outline:new-lark',
	'microsoft.com': 'ri:microsoft-fill',
	'netlify.app': 'simple-icons:netlify',
	'pages.dev': 'simple-icons:cloudflare',
	'qq.com': 'ri:qq-fill',
	'taobao.com': 'ri:taobao-fill',
	'thisis.host': 'tabler:star-filled',
	'tmall.com': 'ri:taobao-fill',
	'v2ex.com': 'simple-icons:v2ex',
	'vercel.app': 'simple-icons:vercel',
	'zabaur.app': 'tabler:square-letter-z-filled',
	'zhihu.com': 'ri:zhihu-line',
};

const domainIcons: Record<string, string> = {
	'developer.mozilla.org': 'simple-icons:mdnwebdocs',
	'h5.qzone.qq.com': 'simple-icons:qzone',
	'mp.weixin.qq.com': 'ri:wechat-fill',
};

const file2icon: Record<string, string> = {
	'.babelrc.js': 'catppuccin:babel',
	'.babelrc': 'catppuccin:babel',
	'.crt': 'catppuccin:certificate',
	'.editorconfig': 'catppuccin:editorconfig',
	'.env': 'catppuccin:env',
	'.gitattributes': 'catppuccin:git',
	'.gitconfig': 'catppuccin:git',
	'.gitignore': 'catppuccin:git',
	'.gitkeep': 'catppuccin:git',
	'.gitlab-ci.yml': 'catppuccin:gitlab',
	'.gitmodules': 'catppuccin:git',
	'.key': 'catppuccin:key',
	'.npmrc': 'catppuccin:npm',
	'.patch': 'catppuccin:git',
	'.prettierrc': 'catppuccin:prettier',
	'astro.config.mjs': 'catppuccin:astro-config',
	'CHANGELOG.md': 'catppuccin:changelog',
	'CODE_OF_CONDUCT.md': 'catppuccin:code-of-conduct',
	'CODEOWNERS': 'catppuccin:codeowners',
	'CONTRIBUTING.md': 'catppuccin:contributing',
	'docker-compose.yml': 'catppuccin:docker-compose',
	'eslint.config.js': 'catppuccin:eslint',
	'eslint.config.mjs': 'catppuccin:eslint',
	'LICENSE': 'catppuccin:license',
	'netlify.toml': 'catppuccin:netlify',
	'next.config.ts': 'catppuccin:next',
	'nuxt.config.ts': 'catppuccin:nuxt',
	'package.json': 'catppuccin:package-json',
	'pnpm-workspace.yaml': 'catppuccin:pnpm',
	'postcss.config.js': 'catppuccin:postcss',
	'prettier.config.js': 'catppuccin:prettier',
	'pyproject.toml': 'catppuccin:python-config',
	'README.md': 'catppuccin:readme',
	'renovate.json': 'catppuccin:renovate',
	'requirements.txt': 'catppuccin:python-config',
	'robots.txt': 'catppuccin:robots',
	'rollup.config.js': 'catppuccin:rollup',
	'SECURITY.md': 'catppuccin:security',
	'stylelint.config.js': 'catppuccin:stylelint',
	'stylelint.config.mjs': 'catppuccin:stylelint',
	'tailwind.config.js': 'catppuccin:tailwind',
	'tsconfig.json': 'catppuccin:typescript-config',
	'verccel.json': 'catppuccin:vercel',
	'vite.config.js': 'catppuccin:vite',
	'vite.config.ts': 'catppuccin:vite',
	'webpack.config.js': 'catppuccin:webpack',
	'yarn.lock': 'catppuccin:yarn',
};

const ext2lang: Record<string, string> = {
	'bat': 'catppuccin:batch',
	'c': 'catppuccin:c',
	'c++': 'catppuccin:cpp',
	'cpp': 'catppuccin:cpp',
	'css': 'catppuccin:css',
	'diff': 'catppuccin:diff',
	'dockerfile': 'catppuccin:docker',
	'gql': 'catppuccin:graphql',
	'hs': 'catppuccin:haskell',
	'html': 'catppuccin:html',
	'ini': 'catppuccin:properties',
	'java': 'catppuccin:java',
	'js': 'catppuccin:javascript',
	'json': 'catppuccin:json',
	'jsonc': 'catppuccin:json',
	'jsx': 'catppuccin:javascript-react',
	'log': 'catppuccin:log',
	'make': 'catppuccin:makefile',
	'makefile': 'catppuccin:makefile',
	'matlab': 'catppuccin:matlab',
	'md': 'catppuccin:markdown',
	'mdc': 'catppuccin:markdown',
	'mdx': 'catppuccin:markdown',
	'mermaid': 'catppuccin:mermaid',
	'mmd': 'catppuccin:mermaid',
	'powershell': 'catppuccin:powershell',
	'ps': 'catppuccin:powershell',
	'ps1': 'catppuccin:powershell',
	'py': 'catppuccin:python',
	'python': 'catppuccin:python',
	'rs': 'catppuccin:rust',
	'scss': 'catppuccin:sass',
	'sh': 'catppuccin:bash',
	'shell': 'catppuccin:bash',
	'shellscript': 'catppuccin:bash',
	'sql': 'catppuccin:database',
	'ssh-config': 'catppuccin:properties',
	'ssh': 'catppuccin:properties',
	'toml': 'catppuccin:toml',
	'ts': 'catppuccin:typescript',
	'tsx': 'catppuccin:typescript-react',
	'vb': 'catppuccin:visual-studio',
	'vue': 'catppuccin:vue',
	'xml': 'catppuccin:xml',
	'yaml': 'catppuccin:yaml',
	'yml': 'catppuccin:yaml',
	'zsh': 'catppuccin:bash',
};

const archIcons: Record<string, string> = {
	'Astro': 'simple-icons:astro',
	'Cloudflare': 'simple-icons:cloudflare',
	'Deno Deploy': 'simple-icons:deno',
	'EdgeOne': 'simple-icons:cloudnativebuild', // 不准确
	'Express': 'simple-icons:express',
	'Fly': 'tabler:air-balloon',
	'Framer': 'simple-icons:framer',
	'Ghost': 'simple-icons:ghost',
	'GitHub Pages': 'simple-icons:github',
	'Golang': 'simple-icons:go',
	'Gridea': 'tabler:square-rounded-letter-g-filled', // 不准确
	'Halo': 'material-symbols:h-mobiledata-badge', // 不准确
	'Hexo': 'simple-icons:hexo',
	'HTML': 'simple-icons:html5',
	'Hugo': 'simple-icons:hugo',
	'Jekyll': 'simple-icons:jekyll',
	'Material for MkDocs': 'simple-icons:materialformkdocs',
	'Netlify': 'simple-icons:netlify',
	'Next.js': 'simple-icons:nextdotjs',
	'Notion': 'simple-icons:notion',
	'NotionNext': 'simple-icons:notion',
	'Nuxt': 'simple-icons:nuxt',
	'PHP': 'simple-icons:php',
	'Python': 'simple-icons:python',
	'React': 'simple-icons:react',
	'Typecho': 'icon-park-solid:align-text-left-one', // 不准确
	'Valaxy': 'tabler:letter-v', // 不准确
	'Vercel': 'simple-icons:vercel',
	'VitePress': 'simple-icons:vitepress',
	'Vue': 'uim:vuejs',
	'VuePress': 'uim:vuejs',
	'WordPress': 'simple-icons:wordpress',
	'Zeabur': 'tabler:square-letter-z-filled', // 不准确
	'国内 CDN': 'tabler:cloud-data-connection',
	'服务器': 'tabler:server',
	'虚拟主机': 'tabler:cloud-upload',
};

export function contentLinkIcon(href: string): string | undefined {
  try {
    const url = new URL(href);
    if (!/^https?:$/.test(url.protocol)) return undefined;
    if (Object.hasOwn(domainIcons, url.hostname)) return domainIcons[url.hostname];
    const domain = Object.keys(mainDomainIcons).find(name => url.hostname === name || url.hostname.endsWith(`.${name}`));
    return domain ? mainDomainIcons[domain] : undefined;
  } catch { return undefined; }
}

export function contentCodeIcon(language: string, filename?: string): string {
  const file = filename && Object.keys(file2icon).find(name => filename.endsWith(name));
  return file ? file2icon[file] : Object.hasOwn(ext2lang, language) ? ext2lang[language] : "catppuccin:file";
}

export function contentArchIcon(name: string): string | undefined {
  return Object.hasOwn(archIcons, name) ? archIcons[name] : undefined;
}
