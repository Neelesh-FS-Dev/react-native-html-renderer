import {
  StyleSheet,
  ScrollView,
  Linking,
  Text,
  View,
  useWindowDimensions,
  useColorScheme,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { HtmlRenderer } from 'react-native-html-renderer';
import type { CustomRendererProps } from 'react-native-html-renderer';

const sampleHTML = `
  <h1>React Native HTML Renderer</h1>
  <p>A <strong>modern</strong>, <em>lightweight</em> library for rendering HTML
     into <u>100% native</u> React Native views.</p>

  <h2>Heading Levels</h2>
  <h3>H3 — Sub-section</h3>
  <h4>H4 — Detail</h4>
  <h5>H5 — Fine print</h5>
  <h6>H6 — Smallest</h6>

  <h2>Inline Styles</h2>
  <p style="color: #e74c3c; font-size: 18px; font-weight: bold;">
    Red bold text at 18px via inline CSS
  </p>
  <p>Normal text with <mark>highlighted</mark> and
     <del>deleted</del> and <ins>inserted</ins> words.</p>
  <p><small>Small text</small> and <code>inline code</code>.</p>

  <h2>Accessibility</h2>
  <p aria-label="Custom accessible label">This paragraph has aria-label.</p>
  <p><span aria-hidden="true">Hidden from screen readers</span></p>
  <a href="https://github.com" aria-label="GitHub homepage">GitHub</a>

  <h2>Links</h2>
  <p>Visit <a href="https://github.com/Neelesh-FS-Dev/react-native-html-renderer">the repository</a> on GitHub.</p>

  <h2>Image</h2>
  <img src="https://picsum.photos/600/200"
       width="600" height="200" alt="Sample banner image" />

  <h2>Unordered List</h2>
  <ul>
    <li>First item</li>
    <li>Second item</li>
    <li>Nested list:
      <ul>
        <li>Nested A</li>
        <li>Nested B</li>
      </ul>
    </li>
  </ul>

  <h2>Ordered List</h2>
  <ol>
    <li>Step one</li>
    <li>Step two</li>
    <li>Step three</li>
  </ol>

  <h2>Blockquote</h2>
  <blockquote>
    <p>This is a blockquote rendered with a <strong>custom renderer</strong>
       that adds a colored left border.</p>
  </blockquote>

  <h2>Code Block</h2>
  <pre>const greeting = "Hello, world!";
console.log(greeting);</pre>

  <h2>Table</h2>
  <table>
    <thead>
      <tr><th>Feature</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr><td>HTML parsing</td><td>Done</td></tr>
      <tr><td>Inline CSS</td><td>Done</td></tr>
      <tr><td>Custom renderers</td><td>Done</td></tr>
      <tr><td>Dark mode</td><td>Done</td></tr>
      <tr><td>Accessibility</td><td>Done</td></tr>
      <tr><td>Security / XSS</td><td>Done</td></tr>
    </tbody>
  </table>

  <h2>Horizontal Rule</h2>
  <hr />

  <h2>Interactive Forms</h2>
  <p>Text input:</p>
  <input type="text" name="sample" value="Sample input value" />
  <p>Checkbox:</p>
  <input type="checkbox" name="agree" checked /> I agree
  <p>Radio group:</p>
  <input type="radio" name="plan" value="free" checked /> Free
  <input type="radio" name="plan" value="pro" /> Pro
  <p>Select:</p>
  <select name="color">
    <option value="red">Red</option>
    <option value="green" selected>Green</option>
    <option value="blue">Blue</option>
  </select>
  <p>Button:</p>
  <button>Click Me</button>

  <h2>Inline SVG</h2>
  <svg viewBox="0 0 100 60" width="200" height="120">
    <rect x="5" y="5" width="30" height="30" fill="#3b82f6" rx="4"/>
    <circle cx="60" cy="30" r="20" fill="#10b981"/>
    <line x1="0" y1="55" x2="100" y2="55" stroke="#ef4444" stroke-width="2"/>
  </svg>

  <h2>CSS Grid (3 columns)</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8">
    <div style="background:#fee2e2;padding:8">One</div>
    <div style="background:#dbeafe;padding:8">Two</div>
    <div style="background:#dcfce7;padding:8">Three</div>
  </div>

  <h2>RTL content</h2>
  <p lang="ar" dir="rtl">مرحبا بالعالم — Hello World</p>

  <h2>Security (XSS stripped)</h2>
  <p>Script tags are stripped: <script>alert("xss")</script>safe content.</p>
  <p>Event handlers removed: <span onclick="alert(1)">click me</span></p>
  <p>JS hrefs neutralized: <a href="javascript:alert(1)">safe link</a></p>

  <h2>Class &amp; ID Styling</h2>
  <p class="highlight">This paragraph has class="highlight".</p>
  <p id="special">This paragraph has id="special".</p>

  <h2>Media Placeholders</h2>
  <video src="video.mp4" aria-label="Demo video"></video>
  <audio src="audio.mp3" aria-label="Demo audio"></audio>
`;

const blockquoteStyle = StyleSheet.create({
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingLeft: 16,
    paddingVertical: 12,
    marginVertical: 8,
    borderRadius: 6,
  },
});

function customBlockquote({ children }: CustomRendererProps) {
  return <View style={blockquoteStyle.blockquote}>{children}</View>;
}

export default function App() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const contentWidth = width - 48;

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isDark && styles.cardDark]}>
          <HtmlRenderer
            html={sampleHTML}
            contentWidth={contentWidth}
            onLinkPress={(href: string) => Linking.openURL(href)}
            onFormChange={(field, nextState) =>
              console.log('[form]', field, nextState)
            }
            lazyLoadImages
            mediaQueries={[
              { maxWidth: 400, tagsStyles: { h1: { fontSize: 22 } } },
            ]}
            customRenderers={{ blockquote: customBlockquote }}
            tagsStyles={{
              h1: {
                color: isDark ? '#f1f5f9' : '#0f172a',
                fontSize: 28,
                fontWeight: '800',
                marginBottom: 6,
                marginTop: 0,
                lineHeight: 34,
              },
              h2: {
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontSize: 20,
                fontWeight: '700',
                marginTop: 28,
                marginBottom: 12,
                paddingBottom: 8,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: isDark ? '#334155' : '#e2e8f0',
              },
              h3: {
                color: isDark ? '#cbd5e1' : '#334155',
                fontSize: 17,
                fontWeight: '600',
                marginTop: 6,
                marginBottom: 4,
              },
              h4: {
                color: isDark ? '#94a3b8' : '#475569',
                fontSize: 15,
                fontWeight: '600',
                marginTop: 4,
                marginBottom: 2,
              },
              h5: {
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: 13,
                fontWeight: '600',
                marginTop: 2,
                marginBottom: 2,
              },
              h6: {
                color: isDark ? '#64748b' : '#94a3b8',
                fontSize: 11,
                fontWeight: '600',
                marginTop: 2,
                marginBottom: 2,
              },
              p: {
                color: isDark ? '#cbd5e1' : '#374151',
                fontSize: 15,
                lineHeight: 22,
                marginVertical: 6,
              },
              a: {
                color: isDark ? '#60a5fa' : '#2563eb',
                textDecorationLine: 'underline',
              },
              strong: { fontWeight: '700' },
              em: { fontStyle: 'italic' },
              u: { textDecorationLine: 'underline' },
              del: {
                textDecorationLine: 'line-through',
                color: isDark ? '#ef4444' : '#dc2626',
              },
              ins: {
                textDecorationLine: 'underline',
                color: isDark ? '#22c55e' : '#16a34a',
              },
              mark: {
                backgroundColor: isDark ? '#854d0e' : '#fef08a',
                color: isDark ? '#fef08a' : '#92400e',
                paddingHorizontal: 3,
                borderRadius: 2,
              },
              small: {
                fontSize: 12,
                color: isDark ? '#94a3b8' : '#6b7280',
              },
              code: {
                fontFamily: 'Menlo',
                fontSize: 13,
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                color: isDark ? '#e879f9' : '#be185d',
                paddingHorizontal: 5,
                paddingVertical: 1,
                borderRadius: 4,
              },
              pre: {
                fontFamily: 'Menlo',
                fontSize: 13,
                lineHeight: 20,
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                color: isDark ? '#e2e8f0' : '#1e293b',
                padding: 14,
                borderRadius: 8,
                marginVertical: 8,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              },
              ul: { marginVertical: 6, paddingLeft: 8 },
              ol: { marginVertical: 6, paddingLeft: 8 },
              li: {
                color: isDark ? '#cbd5e1' : '#374151',
                fontSize: 15,
                lineHeight: 22,
                marginVertical: 3,
              },
              hr: {
                height: 1,
                backgroundColor: isDark ? '#475569' : '#d1d5db',
                marginVertical: 20,
              },
              table: {
                marginVertical: 8,
                borderRadius: 8,
                overflow: 'hidden',
              },
              th: {
                fontWeight: '600',
                fontSize: 14,
                padding: 10,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: isDark ? '#334155' : '#e5e7eb',
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                color: isDark ? '#e2e8f0' : '#1e293b',
              },
              td: {
                fontSize: 14,
                padding: 10,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: isDark ? '#334155' : '#e5e7eb',
                color: isDark ? '#cbd5e1' : '#374151',
              },
              input: {
                borderWidth: 1,
                borderColor: isDark ? '#334155' : '#d1d5db',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginVertical: 4,
                fontSize: 14,
                backgroundColor: isDark ? '#1e293b' : '#f9fafb',
                color: isDark ? '#e2e8f0' : '#1f2937',
              },
              button: {
                backgroundColor: isDark ? '#1e40af' : '#2563eb',
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginVertical: 4,
                alignItems: 'center',
              },
              img: {
                borderRadius: 8,
                marginVertical: 4,
              },
            }}
            classesStyles={{
              highlight: {
                backgroundColor: isDark ? '#5c4a00' : '#fef9c3',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              },
            }}
            idsStyles={{
              special: { color: '#7c3aed', fontWeight: 'bold' },
            }}
            darkModeStyles={{
              p: { color: '#cbd5e1' },
              li: { color: '#cbd5e1' },
              pre: {
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                borderColor: '#1e293b',
              },
              code: {
                backgroundColor: '#1e293b',
                color: '#e879f9',
              },
            }}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            debug={false}
          />
        </View>
        <Text style={[styles.footer, isDark && styles.footerDark]}>
          react-native-html-renderer
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  safeAreaDark: {
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0,
  },
  footer: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  footerDark: {
    color: '#475569',
  },
});
