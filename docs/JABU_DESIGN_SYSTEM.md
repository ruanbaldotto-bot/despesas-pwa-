# Jabu — sistema de design

Implementação vetorial própria orientada pelas três referências visuais anexadas pelo proprietário. Não representa extração literal do símbolo das imagens. A aplicação usa a paleta oficial do texto: mata #0F3D2E, folhas #2E6B4F, sálvia #A7C4A8, céu #7CC0E8, mar #1E6F8C, terra #B88A5A, areia #F6F1E6 e jabuticaba #3A1E3E.

Tokens centralizados em design-tokens.css: cores de marca, semânticas e bancárias, fontes, espaços, bordas, raios, sombras, movimento e foco. Serifada Georgia/Times em títulos e marca; fontes de sistema em valores, formulários e navegação. Sem download de fontes.

Símbolo: tronco fino, poucos galhos e folhas, três frutos e círculo discreto. SVGs horizontal claro/escuro, símbolo claro/escuro e favicon em icons/. PNGs 192, 512, 180, favicon 32 e maskable 512 gerados localmente por node tools/build-brand.cjs. O maskable mantém o símbolo na região central segura. Não há paisagem, 3D ou sombra no símbolo.

Componentes claros em areia, cabeçalhos mata, botões folhas, foco azul-mar, estados vazios, campos de 46px, alertas sem dependência exclusiva de cor, contraste de texto escuro nas superfícies claras. Formulários têm tipografia de 16px; navegação e conteúdo respeitam safe areas. Elementos dinâmicos monetários usam números tabulares. Movimento respeita prefers-reduced-motion.

A revisão visual em Safari/iPhone físico permanece pendente. Contraste por tokens e verificações estruturais não substituem validação renderizada e VoiceOver.
