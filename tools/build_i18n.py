"""Builds en.html and sv.html from the Finnish index.html, and refreshes the language switcher on all three.

Usage (from the repo root):  python3 tools/build_i18n.py
Edit the Finnish page, add any new texts to tools/i18n.json, and run this again.
The build stops and lists every Finnish text that has no translation yet.
"""
import json
import re
import sys
from urllib.parse import quote

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
DATA = json.load(open(ROOT + '/tools/i18n.json', encoding='utf-8'))
SAME = set(DATA['same'])
PAGES = {'fi': 'index.html', 'en': 'en.html', 'sv': 'sv.html'}
CV = {'fi': 'Rauli_Rantanen_CV', 'en': 'Rauli_Rantanen_CV_EN', 'sv': 'Rauli_Rantanen_CV_SV'}
LABEL = {'fi': ('FI', 'Suomeksi'), 'en': ('EN', 'In English'), 'sv': ('SV', 'På svenska')}
GROUP = {'fi': 'Kieli', 'en': 'Language', 'sv': 'Språk'}

FLAGS = {
    'fi': ('<svg aria-hidden="true" width="28" height="18" viewBox="0 0 18 11" preserveAspectRatio="none" style="display: block; border-radius: 3px; box-shadow: 0 0 0 1px #DCE6EF">'
           '<rect width="18" height="11" fill="#FFFFFF"></rect><rect x="5" width="3" height="11" fill="#002F6C"></rect><rect y="4" width="18" height="3" fill="#002F6C"></rect></svg>'),
    'sv': ('<svg aria-hidden="true" width="28" height="18" viewBox="0 0 16 10" preserveAspectRatio="none" style="display: block; border-radius: 3px">'
           '<rect width="16" height="10" fill="#006AA7"></rect><rect x="5" width="2" height="10" fill="#FECC02"></rect><rect y="4" width="16" height="2" fill="#FECC02"></rect></svg>'),
    'en': ('<svg aria-hidden="true" width="28" height="18" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" style="display: block; border-radius: 3px">'
           '<clipPath id="uk-flag-s"><path d="M0,0 v30 h60 v-30 z"></path></clipPath>'
           '<clipPath id="uk-flag-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"></path></clipPath>'
           '<g clip-path="url(#uk-flag-s)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"></path>'
           '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" stroke-width="6"></path>'
           '<path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#uk-flag-t)" stroke="#C8102E" stroke-width="4"></path>'
           '<path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" stroke-width="10"></path>'
           '<path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"></path></g></svg>'),
}


def switcher(cur):
    links = []
    for lang in ('fi', 'en', 'sv'):
        code, name = LABEL[lang]
        active = lang == cur
        style = ('display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 12px; border-radius: 999px; '
                 'font-weight: 700; font-size: 14px; text-decoration: none; box-sizing: border-box; '
                 + ('background: #0B2545; color: #FFFFFF; border: 1px solid #0B2545' if active
                    else 'color: #0B2545; border: 1px solid #DCE6EF'))
        links.append('<a href="%s" hreflang="%s" lang="%s" aria-label="%s"%s style="%s">%s<span>%s</span></a>' % (
            PAGES[lang], lang, lang, name, ' aria-current="page"' if active else '', style, FLAGS[lang], code))
    return ('<!--lang-switch--><nav aria-label="%s" style="display: flex; gap: 6px; align-items: center">%s</nav><!--/lang-switch-->'
            % (GROUP[cur], ''.join(links)))


def alternates():
    base = 'https://samppafin.github.io/RauliRantanenCV/'
    tags = ''.join('<link rel="alternate" hreflang="%s" href="%s%s">\n' % (l, base, '' if l == 'fi' else PAGES[l]) for l in ('fi', 'en', 'sv'))
    return '<!--hreflang-->\n' + tags + '<!--/hreflang-->\n'


def mailto(lang):
    m = DATA['mail'][lang]
    return 'mailto:rauli.rantanen@gmail.com?subject=%s&amp;body=%s' % (quote(m['subject']), quote(m['body']))


def with_switcher(h, lang):
    h = re.sub(r'<!--lang-switch-->.*?<!--/lang-switch-->', '', h, flags=re.S)
    h = re.sub(r'<!--hreflang-->\n.*?<!--/hreflang-->\n', '', h, flags=re.S)
    nav_end = h.index('</nav>', h.index('<header')) + len('</nav>')
    h = h[:nav_end] + '\n' + switcher(lang) + h[nav_end:]
    return h.replace('</head>', alternates() + '</head>', 1)


src = open(ROOT + '/index.html', encoding='utf-8').read()
src = with_switcher(src, 'fi')
fi_mail = mailto('fi')
assert fi_mail in src, 'Finnish mailto link not found'
open(ROOT + '/index.html', 'w', encoding='utf-8').write(src)

missing = {}
for lang in ('en', 'sv'):
    texts, attrs = DATA['site'][lang], DATA['attrs'][lang]
    h = re.sub(r'<!--lang-switch-->.*?<!--/lang-switch-->', '', src, flags=re.S)
    protected = {}

    def keep(m):
        protected['\x00%d\x00' % len(protected)] = m.group(0)
        return '\x00%d\x00' % (len(protected) - 1)
    h = re.sub(r'<style.*?</style>|<script.*?</script>|<svg.*?</svg>', keep, h, flags=re.S)

    def tr_text(m):
        raw = m.group(1)
        t = raw.strip()
        if not t or not re.search(r'[A-Za-zÅÄÖåäö]', t) or t in SAME:
            return m.group(0)
        if t not in texts:
            missing.setdefault(lang, []).append(t)
            return m.group(0)
        return '>' + raw.replace(t, texts[t]) + '<'
    h = re.sub(r'>([^<>]+)<', tr_text, h)

    def tr_attr(m):
        v = m.group(2)
        if v in attrs:
            return '%s="%s"' % (m.group(1), attrs[v])
        if m.group(1) in ('alt', 'aria-label') or (m.group(1) == 'content' and re.search(r'[äö]', v)):
            missing.setdefault(lang, []).append('[attr] ' + v)
        return m.group(0)
    h = re.sub(r'\b(alt|aria-label|content)="([^"]+)"', tr_attr, h)

    for k, v in protected.items():
        h = h.replace(k, v)
    h = h.replace('<html lang="fi">', '<html lang="%s">' % lang, 1)
    h = h.replace(fi_mail, mailto(lang))
    for ext in ('pdf', 'docx'):
        h = h.replace('liitteet/%s.%s' % (CV['fi'], ext), 'liitteet/%s.%s' % (CV[lang], ext))
    h = with_switcher(re.sub(r'<!--hreflang-->\n.*?<!--/hreflang-->\n', '', h, flags=re.S), lang)
    open(ROOT + '/' + PAGES[lang], 'w', encoding='utf-8').write(h)

if missing:
    for lang, items in missing.items():
        print('Missing %s translations:' % lang)
        for t in dict.fromkeys(items):
            print('  ', t)
    sys.exit(1)
print('built', ', '.join(PAGES.values()))
