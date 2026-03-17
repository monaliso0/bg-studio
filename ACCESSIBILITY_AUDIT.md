# Audit de Acessibilidade — OneBack
**Data:** 2026-03-17
**Padrão de referência:** WCAG 2.2 níveis A e AA
**Escopo:** Landing page, Editor (Single/Multi), Componentes (Controls, AccountArea, NavAccount, MobileMenu, ImageCard, Uploader, CheckoutButton)

---

## Resumo Executivo

| Severidade | Qtd | Critério WCAG |
|---|---|---|
| 🔴 Crítico (A) | 5 | Falhas que bloqueiam uso por teclado e screen reader |
| 🟠 Alto (AA) | 8 | Falhas que degradam significativamente a experiência |
| 🟡 Médio | 9 | Melhorias importantes para conformidade e UX |

**Nível atual estimado:** Abaixo de A
**Nível alcançável após correções:** AA

---

## 🔴 CRÍTICO — WCAG Nível A

Falhas que tornam partes do site **inutilizáveis** para usuários de teclado e/ou screen reader.

---

### A-01 · Foco visível ausente em toda a interface
**Critério:** WCAG 2.4.7 Focus Visible (AA) · 2.4.11 Focus Appearance (WCAG 2.2, AA)
**Arquivos:** `globals.css`, todos os componentes

O Tailwind CSS remove o `outline` padrão do navegador via reset. Nenhum componente define um estilo de foco substituto. Resultado: usuários de teclado não conseguem identificar visualmente qual elemento está em foco.

**Afeta:** todos os `<button>`, `<a>`, `<input>`, `<label>` interativos do site.

**Correção:** Adicionar em `globals.css`:
```css
:focus-visible {
  outline: 2px solid #111111;
  outline-offset: 2px;
}
```
E garantir que nenhum componente use `focus:outline-none` sem substituir por `focus-visible:ring-*` ou equivalente.

---

### A-02 · Botão "Sair" inacessível por teclado
**Critério:** WCAG 2.1.1 Keyboard (A)
**Arquivo:** `components/AccountArea.tsx` (linha 80–85)

```tsx
// PROBLEMA: só aparece no hover CSS — tab não chega aqui
<button className="hidden group-hover:block ...">Sair</button>
```

O botão usa `hidden group-hover:block` — aparece apenas com hover do mouse. Usuários de teclado nunca conseguem alcançá-lo via Tab.

**Correção:** Usar `focus-within` para também revelar o botão quando o grupo recebe foco:
```tsx
className="hidden group-hover:block group-focus-within:block ..."
```

---

### A-03 · Focus trap ausente no MobileMenu
**Critério:** WCAG 2.1.2 No Keyboard Trap (A) / WCAG 2.4.3 Focus Order (A)
**Arquivo:** `components/MobileMenu.tsx`

Quando o menu mobile abre (overlay full-screen), o foco não é preso dentro dele. Pressionar Tab pode mover o foco para elementos invisíveis por trás do overlay. Ao fechar, o foco não retorna ao botão que abriu o menu.

**Correção:**
- Ao abrir: mover foco para o primeiro elemento focável dentro do menu (ex: botão fechar).
- Implementar focus trap: interceptar Tab/Shift+Tab para ciclar apenas dentro do menu.
- Ao fechar (`onClose`): devolver foco ao botão "Open settings".
- Adicionar `role="dialog"` e `aria-modal="true"` (ver A-04).

---

### A-04 · Modal de upgrade sem semântica de dialog
**Critério:** WCAG 4.1.2 Name, Role, Value (A) · WCAG 2.1.2 (A)
**Arquivo:** `app/editor/page.tsx` (linhas 641–686)

```tsx
// PROBLEMA: apenas uma div, sem role, sem aria-modal, sem aria-labelledby
<div className="fixed inset-0 z-50 bg-black/40 ...">
  <div className="bg-white w-full max-w-sm p-8 ...">
    ...
  </div>
</div>
```

Screen readers não sabem que é um modal. Foco não é preso. Não há `aria-labelledby` apontando para o título. Pressionar Escape não fecha (sem handler).

**Correção:**
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title" ...>
  <p id="upgrade-modal-title" ...>Modo Multi requer assinatura Pro</p>
  ...
</div>
```
Adicionar focus trap e fechar com `Escape`.

---

### A-05 · Skip link ausente
**Critério:** WCAG 2.4.1 Bypass Blocks (A)
**Arquivo:** `app/layout.tsx`

Não há "Pular para o conteúdo principal". Usuários de teclado precisam navegar por toda a navbar em cada página.

**Correção:** Adicionar antes de `{children}` em `layout.tsx`:
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:text-sm"
>
  Pular para o conteúdo
</a>
```
E adicionar `id="main-content"` no `<main>` de cada página.

---

## 🟠 ALTO — WCAG Nível AA

---

### B-01 · Contraste de cor insuficiente em múltiplos textos
**Critério:** WCAG 1.4.3 Contrast (Minimum) (AA) — mínimo 4.5:1 texto normal, 3:1 texto grande
**Arquivos:** `app/page.tsx`, `app/editor/page.tsx`, `components/Controls.tsx`, `components/AccountArea.tsx`

| Classe Tailwind | Cor efetiva | Fundo | Contraste | Resultado |
|---|---|---|---|---|
| `text-black/30` | `#B3B3B3` | `#ffffff` | ~1.5:1 | ❌ FALHA |
| `text-black/40` | `#999999` | `#ffffff` | ~2.85:1 | ❌ FALHA |
| `text-black/50` | `#808080` | `#ffffff` | ~3.95:1 | ❌ texto normal |
| `text-white/50` | `#808080` | `#111111` | ~3.95:1 | ❌ texto normal |
| `text-white/60` | `#999999` | `#000000` | ~2.85:1 | ❌ FALHA |
| `text-white/70` | `#B3B3B3` | `#000000` | ~1.5:1 | ❌ FALHA |

Exemplos de ocorrências:
- Landing: labels de seção ("Resultado imediato", "Consistência visual") — `text-black/30`
- Landing: "Sem burocracia. Cancele quando quiser." — `text-black/40`
- Landing: preço do Pro (`text-white/70`) e "ou R$ 249/ano" (`text-white/60`)
- Editor: labels de controles (Background, Aspect Ratio etc.) — `text-black/50`
- AccountArea: plano e downloads restantes — `text-white/50`

**Correção sugerida:**

| Uso | Troca sugerida | Contraste |
|---|---|---|
| Labels decorativos secundários (seções) | `text-black/40` → `text-black/60` | ~5.7:1 ✅ |
| Textos descritivos | `text-black/50` → `text-black/60` | ~5.7:1 ✅ |
| Textos sobre preto | `text-white/50` → `text-white/70` | ~5.9:1 ✅ |
| Subtexto sobre preto | `text-white/60` → `text-white/75` | ~6.5:1 ✅ |

---

### B-02 · SVGs decorativos sem `aria-hidden`
**Critério:** WCAG 1.1.1 Non-text Content (A)
**Arquivos:** `app/page.tsx`, `app/editor/page.tsx`, `components/MobileMenu.tsx`, `components/Uploader.tsx`

SVGs sem `aria-hidden="true"` são lidos por screen readers, gerando ruído ou leitura incompleta.

| SVG | Arquivo | Contexto |
|---|---|---|
| `OneBackLogo` | `page.tsx`, `editor/page.tsx` | Logo dentro de `<Link>` ou `<div>` — decorativo quando já há contexto |
| `TuneIcon` | `editor/page.tsx` | Dentro de botão com `aria-label` ✅ — o SVG precisa de `aria-hidden` |
| `UploadIcon` | `components/Uploader.tsx` | Decorativo — texto adjacente descreve a ação |
| `CHECK_ICON` | `app/page.tsx` | Dentro de `<li>` com texto — decorativo |
| `CloseIcon` | `components/MobileMenu.tsx` | Dentro de botão com `aria-label` ✅ — SVG precisa de `aria-hidden` |

**Correção:** Adicionar `aria-hidden="true"` em todos os SVGs decorativos. Para o logo como link, usar `aria-label` no `<Link>`:
```tsx
<Link href="/" aria-label="OneBack — ir para a página inicial">
  <OneBackLogo aria-hidden="true" />
</Link>
```

---

### B-03 · Inputs sem labels associados programaticamente
**Critério:** WCAG 1.3.1 Info and Relationships (A) · 4.1.2 Name, Role, Value (A)
**Arquivos:** `components/Controls.tsx`, `components/MobileMenu.tsx`

Os `<label>` de "Background", "Padding" etc. não têm `htmlFor` apontando para os inputs. A associação é apenas visual/proximidade, não programática.

```tsx
// PROBLEMA: label não associada
<label className="block text-xs ...">Background</label>
<input type="color" ... />   // sem id
<input type="text" ... />    // sem id
```

**Correção:**
```tsx
<label htmlFor="bg-color-picker" className="block text-xs ...">Cor de fundo</label>
<input id="bg-color-picker" type="color" ... />

<label htmlFor="bg-color-hex" className="sr-only">Hex da cor de fundo</label>
<input id="bg-color-hex" type="text" ... />

<label htmlFor="padding-range" className="text-xs ...">Padding</label>
<input id="padding-range" type="range" ... />
```

---

### B-04 · Mode tabs sem estado semântico
**Critério:** WCAG 4.1.2 Name, Role, Value (A)
**Arquivo:** `app/editor/page.tsx` (linhas 506–523)

```tsx
<button onClick={() => setMode("single")} className={...}>Single</button>
<button onClick={() => setMode("multi")} className={...}>Multi</button>
```

A diferença visual entre ativo/inativo não é comunicada via ARIA. Screen readers não sabem qual modo está selecionado.

**Correção:** Usar `aria-pressed` ou estrutura de tabs:
```tsx
<div role="tablist" aria-label="Modo de processamento">
  <button role="tab" aria-selected={mode === "single"} aria-controls="panel-single">
    Single
  </button>
  <button role="tab" aria-selected={mode === "multi"} aria-controls="panel-multi">
    Multi
  </button>
</div>
<div id="panel-single" role="tabpanel" ...>...</div>
<div id="panel-multi" role="tabpanel" ...>...</div>
```

---

### B-05 · Mensagens de erro sem `role="alert"`
**Critério:** WCAG 4.1.3 Status Messages (AA)
**Arquivos:** `app/editor/page.tsx`, `components/ImageCard.tsx`

Quando o processamento de uma imagem falha, a mensagem de erro é renderizada no DOM mas não anunciada automaticamente por screen readers.

```tsx
// PROBLEMA: div/p simples, sem live region
<div className="flex flex-col items-center gap-4 text-center">
  <p className="text-sm text-black/50">Não foi possível processar a imagem.</p>
  ...
</div>
```

**Correção:**
```tsx
<div role="alert">
  <p>Não foi possível processar a imagem.</p>
  ...
</div>
```
Para erros dos ImageCards no Multi, adicionar `role="alert"` no container de erro.

---

### B-06 · Banner de sucesso sem `aria-live`
**Critério:** WCAG 4.1.3 Status Messages (AA)
**Arquivo:** `app/editor/page.tsx` (linhas 633–638)

```tsx
// PROBLEMA: banner sem live region
<div className="fixed top-4 ...">
  Assinatura Pro ativada! Bem-vindo ao Pro.
</div>
```

Aparece dinamicamente mas não é anunciado por screen readers.

**Correção:**
```tsx
<div role="status" aria-live="polite" className="fixed top-4 ...">
  Assinatura Pro ativada! Bem-vindo ao Pro.
</div>
```

---

### B-07 · Toggle sem label acessível
**Critério:** WCAG 4.1.2 Name, Role, Value (A)
**Arquivos:** `components/Controls.tsx`, `app/editor/page.tsx` (mobile)

O componente `Toggle` tem `role="switch"` e `aria-checked` corretos, mas não tem `aria-label` ou `aria-labelledby` associando ao texto "Export without background".

```tsx
// PROBLEMA: sem aria-label, sem aria-labelledby
<Toggle value={transparentBg} onChange={onTransparentBg} />
```

**Correção:**
```tsx
// Opção 1: aria-labelledby
<p id="transparent-label" className="text-sm text-ink">Export without background</p>
<Toggle value={transparentBg} onChange={onTransparentBg} aria-labelledby="transparent-label" />

// Ou passar aria-label direto para o button interno:
<button role="switch" aria-checked={value} aria-label="Exportar sem fundo" ...>
```

---

### B-08 · Grupos de seleção exclusiva sem semântica de grupo
**Critério:** WCAG 1.3.1 Info and Relationships (A)
**Arquivos:** `components/Controls.tsx`, `components/MobileMenu.tsx`

Aspect Ratio e Export Format são grupos de botões mutuamente exclusivos. Não comunicam essa relação para screen readers.

**Correção:** Envolver com `role="group"` e `aria-label`, ou usar `<fieldset>`/`<legend>`:
```tsx
<div role="group" aria-label="Aspect ratio">
  {ASPECT_RATIOS.map(({ label, value }) => (
    <button
      aria-pressed={isRatioActive(aspectRatio, value)}
      ...
    >
      {label}
    </button>
  ))}
</div>
```

---

## 🟡 MÉDIO

---

### C-01 · `<main>` ausente na Landing Page
**Critério:** WCAG 1.3.6 Identify Purpose (AAA, mas boa prática AA)
**Arquivo:** `app/page.tsx`

A landing não tem landmark `<main>`. Screen readers e ferramentas de navegação por landmarks ficam sem ponto de entrada para o conteúdo principal.

**Correção:** Envolver o conteúdo após o `<nav>` em `<main id="main-content">`.

---

### C-02 · `<nav>` sem `aria-label`
**Critério:** WCAG 1.3.6
**Arquivo:** `app/page.tsx` (linha 31)

Quando há mais de uma região de navegação na página, cada `<nav>` deve ter `aria-label` para diferenciar.

**Correção:**
```tsx
<nav aria-label="Navegação principal" className="...">
```

---

### C-03 · Foco não retorna após fechar MobileMenu
**Critério:** WCAG 2.4.3 Focus Order (A)
**Arquivo:** `components/MobileMenu.tsx` / `app/editor/page.tsx`

Ao fechar o MobileMenu, o foco some (vai para o `<body>`). Deveria retornar ao botão "Open settings".

**Correção:** No editor, guardar ref do botão e chamar `.focus()` no `onClose`:
```tsx
const menuButtonRef = useRef<HTMLButtonElement>(null);
// No botão: ref={menuButtonRef}
// No onClose: menuButtonRef.current?.focus();
```

---

### C-04 · Botão de avatar sem `aria-label` confiável
**Critério:** WCAG 4.1.2 Name, Role, Value (A)
**Arquivo:** `components/NavAccount.tsx` (linha 54–64)

O botão usa `title={name}`, que não é lido por todos os screen readers (especialmente mobile). `title` é um atributo de tooltip, não substitui `aria-label`.

**Correção:**
```tsx
<button
  onClick={() => openUserProfile()}
  aria-label={`Abrir perfil de ${name}`}
  ...
>
```

---

### C-05 · CheckoutButton sem `aria-busy` durante loading
**Critério:** WCAG 4.1.2 Name, Role, Value (A)
**Arquivo:** `components/CheckoutButton.tsx`

Quando `loading === true`, o texto muda para "Aguarde..." mas não há indicação semântica de que o botão está processando.

**Correção:**
```tsx
<button
  disabled={loading}
  aria-busy={loading}
  aria-label={loading ? "Processando, aguarde..." : "Assinar Pro"}
  ...
>
```

---

### C-06 · `alert()` nativo em inglês
**Critério:** Não é WCAG, mas afeta consistência linguística e UX
**Arquivo:** `app/editor/page.tsx` (linha 288)

```tsx
alert(`Total file size exceeds ${MAX_MULTI_MB}MB...`); // em inglês
```

O site é em PT-BR. Além disso, `alert()` bloqueia a thread principal.

**Correção:** Substituir por mensagem inline com `role="alert"` ou toast em PT-BR.

---

### C-07 · Strings em inglês no editor (inconsistência de idioma)
**Critério:** WCAG 3.1.2 Language of Parts (AA) — quando partes do conteúdo estão em idioma diferente do `lang` da página
**Arquivos:** `components/Controls.tsx`, `app/editor/page.tsx`

Strings em inglês num produto PT-BR:
- "Single" / "Multi" (tabs do editor)
- "Start over"
- "Download all"
- "Export without background"
- "Aspect Ratio"
- "Export Format"
- "Background" (seção de cor)

Embora WCAG 3.1.2 exija `lang` em trechos de idioma diferente, o problema maior é a experiência do usuário PT-BR.

---

### C-08 · Imagem de avatar com `alt` redundante
**Critério:** WCAG 1.1.1 (A)
**Arquivos:** `components/AccountArea.tsx`, `components/NavAccount.tsx`

```tsx
// O alt repete o nome que já está visível no texto adjacente
<img src={user.imageUrl} alt={name} ... />
<p className="text-sm text-white">{name}</p>
```

Quando a imagem é decorativa (o nome já está no texto), `alt=""` é o correto para evitar duplicação para screen readers.

**Correção:** `alt=""` nos avatares onde o nome está visível no contexto imediato.

---

### C-09 · Seções da landing sem `aria-label`
**Critério:** WCAG 1.3.6
**Arquivo:** `app/page.tsx`

As `<section>` de Features e Pricing não têm `aria-label` ou `aria-labelledby`. Screen readers as listam como "seção" sem identificação.

**Correção:**
```tsx
<section aria-label="Funcionalidades" ...>
<section aria-label="Planos e preços" ...>
```

---

## Ordem de Implementação Sugerida

| Prioridade | ID | Impacto | Esforço |
|---|---|---|---|
| 1 | A-01 | Altíssimo — afeta todo o site | Baixo — 5 linhas de CSS |
| 2 | A-05 | Alto — WCAG A obrigatório | Baixo — 1 componente |
| 3 | A-02 | Alto — botão inacessível | Baixo — 1 classe |
| 4 | B-05 / B-06 | Alto — feedback invisível | Baixo — `role="alert"` / `role="status"` |
| 5 | B-02 | Alto — ruído no screen reader | Baixo — `aria-hidden` |
| 6 | A-03 / A-04 | Alto — modais inacessíveis | Médio — focus trap + ARIA |
| 7 | B-01 | Alto — contraste | Médio — trocar classes de cor |
| 8 | B-03 | Médio — labels | Médio — IDs + htmlFor |
| 9 | B-04 | Médio — tabs | Médio — role="tab" |
| 10 | B-07 / B-08 | Médio — grupos | Baixo — aria-label/group |
| 11 | C-01–C-09 | Baixo/Médio | Variado |

---

## Referências

- [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
- [Accessible Rich Internet Applications (ARIA) — W3C](https://www.w3.org/TR/wai-aria-1.2/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Focus Trap — biblioteca recomendada](https://github.com/focus-trap/focus-trap)
