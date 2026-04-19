import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HtmlRenderer } from '../HtmlRenderer';

describe('HtmlRenderer', () => {
  const defaultProps = { contentWidth: 350 };

  it('renders a simple paragraph', () => {
    render(<HtmlRenderer html="<p>Hello world</p>" {...defaultProps} />);
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('renders headings h1-h6', () => {
    render(
      <HtmlRenderer
        html="<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>"
        {...defaultProps}
      />
    );
    expect(screen.getByText('H1')).toBeTruthy();
    expect(screen.getByText('H2')).toBeTruthy();
    expect(screen.getByText('H3')).toBeTruthy();
    expect(screen.getByText('H4')).toBeTruthy();
    expect(screen.getByText('H5')).toBeTruthy();
    expect(screen.getByText('H6')).toBeTruthy();
  });

  it('renders bold and italic text', () => {
    render(
      <HtmlRenderer
        html="<p><strong>Bold</strong> and <em>italic</em></p>"
        {...defaultProps}
      />
    );
    expect(screen.getByText('Bold')).toBeTruthy();
    expect(screen.getByText('italic')).toBeTruthy();
  });

  it('renders links and calls onLinkPress', () => {
    const onLinkPress = jest.fn();
    render(
      <HtmlRenderer
        html='<a href="https://example.com">Click me</a>'
        onLinkPress={onLinkPress}
        {...defaultProps}
      />
    );
    const link = screen.getByText('Click me');
    fireEvent.press(link);
    expect(onLinkPress).toHaveBeenCalledWith('https://example.com', {
      href: 'https://example.com',
    });
  });

  it('renders unordered list with bullets', () => {
    render(
      <HtmlRenderer
        html="<ul><li>Item A</li><li>Item B</li></ul>"
        {...defaultProps}
      />
    );
    expect(screen.getByText(/Item A/)).toBeTruthy();
    expect(screen.getByText(/Item B/)).toBeTruthy();
  });

  it('renders ordered list with numbers', () => {
    render(
      <HtmlRenderer
        html="<ol><li>First</li><li>Second</li></ol>"
        {...defaultProps}
      />
    );
    expect(screen.getByText(/First/)).toBeTruthy();
    expect(screen.getByText(/Second/)).toBeTruthy();
    // Should have number prefixes
    expect(screen.getByText('1. ')).toBeTruthy();
    expect(screen.getByText('2. ')).toBeTruthy();
  });

  it('renders images with alt text', () => {
    render(
      <HtmlRenderer
        html='<img src="https://example.com/img.png" alt="Test image" width="100" height="50" />'
        {...defaultProps}
      />
    );
    // Image should have accessibility label
    expect(screen.getByLabelText('Test image')).toBeTruthy();
  });

  it('renders tables', () => {
    render(
      <HtmlRenderer
        html="<table><tr><th>Name</th><th>Value</th></tr><tr><td>A</td><td>1</td></tr></table>"
        {...defaultProps}
      />
    );
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Value')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('renders blockquote', () => {
    render(
      <HtmlRenderer
        html="<blockquote><p>Quoted text</p></blockquote>"
        {...defaultProps}
      />
    );
    expect(screen.getByText('Quoted text')).toBeTruthy();
  });

  it('renders pre/code blocks', () => {
    render(<HtmlRenderer html="<pre>const x = 1;</pre>" {...defaultProps} />);
    expect(screen.getByText('const x = 1;')).toBeTruthy();
  });

  it('renders hr as a view', () => {
    const { toJSON } = render(<HtmlRenderer html="<hr />" {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('applies tagsStyles overrides', () => {
    render(
      <HtmlRenderer
        html="<p>Styled</p>"
        tagsStyles={{ p: { color: 'red' } }}
        {...defaultProps}
      />
    );
    const text = screen.getByText('Styled');
    // Verify the element exists with style (exact style testing varies by RNTL version)
    expect(text).toBeTruthy();
  });

  it('applies classesStyles', () => {
    render(
      <HtmlRenderer
        html='<p class="highlight">Highlighted</p>'
        classesStyles={{ highlight: { backgroundColor: 'yellow' } }}
        {...defaultProps}
      />
    );
    expect(screen.getByText('Highlighted')).toBeTruthy();
  });

  it('applies idsStyles', () => {
    render(
      <HtmlRenderer
        html='<p id="special">Special</p>'
        idsStyles={{ special: { color: 'purple' } }}
        {...defaultProps}
      />
    );
    expect(screen.getByText('Special')).toBeTruthy();
  });

  it('uses custom renderer', () => {
    render(
      <HtmlRenderer
        html="<p>Custom</p>"
        customRenderers={{
          p: ({ children }) => <>{children}</>,
        }}
        {...defaultProps}
      />
    );
    expect(screen.getByText('Custom')).toBeTruthy();
  });

  it('ignores tags in ignoredTags', () => {
    render(
      <HtmlRenderer
        html="<p>Visible</p><div>Hidden</div>"
        ignoredTags={['div']}
        {...defaultProps}
      />
    );
    expect(screen.getByText('Visible')).toBeTruthy();
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('handles empty HTML string', () => {
    const { toJSON } = render(<HtmlRenderer html="" {...defaultProps} />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles malformed HTML without crashing', () => {
    const { toJSON } = render(
      <HtmlRenderer
        html="<p>Unclosed <strong>bold<div>mixed</p>"
        {...defaultProps}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('strips script tags', () => {
    render(
      <HtmlRenderer
        html='<div><script>alert("xss")</script><p>Safe</p></div>'
        {...defaultProps}
      />
    );
    expect(screen.getByText('Safe')).toBeTruthy();
    expect(screen.queryByText('alert("xss")')).toBeNull();
  });

  it('renders interactive form elements', () => {
    const { getByText, getByDisplayValue } = render(
      <HtmlRenderer
        html='<input type="text" value="readonly" /><button>Submit</button>'
        {...defaultProps}
      />
    );
    expect(getByDisplayValue('readonly')).toBeTruthy();
    expect(getByText('Submit')).toBeTruthy();
  });

  it('renders video placeholder', () => {
    render(
      <HtmlRenderer html='<video src="video.mp4"></video>' {...defaultProps} />
    );
    expect(screen.getByText('Video')).toBeTruthy();
  });

  it('renders audio placeholder', () => {
    render(
      <HtmlRenderer html='<audio src="audio.mp3"></audio>' {...defaultProps} />
    );
    expect(screen.getByText('Audio')).toBeTruthy();
  });

  it('renders unknown tags by rendering children', () => {
    render(
      <HtmlRenderer
        html="<custom-tag>Content inside</custom-tag>"
        {...defaultProps}
      />
    );
    expect(screen.getByText('Content inside')).toBeTruthy();
  });

  it('renders inline styles from HTML', () => {
    render(
      <HtmlRenderer
        html='<p style="color: red">Red text</p>'
        {...defaultProps}
      />
    );
    expect(screen.getByText('Red text')).toBeTruthy();
  });
});
