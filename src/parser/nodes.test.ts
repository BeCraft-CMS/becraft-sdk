import { describe, it, expect } from 'vitest';
import { MediaNode } from './nodes';

describe('MediaNode', () => {
  describe('constructor', () => {
    it('should create MediaNode with single item', () => {
      const items = [{ src: 'https://example.com/image.jpg' }];
      const node = new MediaNode(items);
      expect(node.type).toBe('media');
      expect(node.items).toHaveLength(1);
      expect(node.items[0].src).toBe('https://example.com/image.jpg');
    });

    it('should create MediaNode with all item attributes', () => {
      const items = [
        {
          key: 'img1',
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
          caption: 'Test caption',
          className: 'test-class',
          width: 800,
          height: 600,
          gridRow: '1/2',
          gridColumn: '1/3',
        },
      ];
      const node = new MediaNode(items);
      expect(node.items[0].key).toBe('img1');
      expect(node.items[0].alt).toBe('Test image');
      expect(node.items[0].caption).toBe('Test caption');
      expect(node.items[0].className).toBe('test-class');
      expect(node.items[0].width).toBe(800);
      expect(node.items[0].height).toBe(600);
      expect(node.items[0].gridRow).toBe('1/2');
      expect(node.items[0].gridColumn).toBe('1/3');
    });

    it('should create MediaNode with gridStyle', () => {
      const items = [{ src: 'https://example.com/image.jpg' }];
      const gridStyle = { rows: 'repeat(2, 1fr)', cols: 'repeat(2, 1fr)' };
      const node = new MediaNode(items, gridStyle);
      expect(node.gridStyle).toBeDefined();
      expect(node.gridStyle?.rows).toBe('repeat(2, 1fr)');
      expect(node.gridStyle?.cols).toBe('repeat(2, 1fr)');
    });

    it('should create MediaNode without gridStyle', () => {
      const items = [{ src: 'https://example.com/image.jpg' }];
      const node = new MediaNode(items);
      expect(node.gridStyle).toBeUndefined();
    });
  });

  describe('from static method', () => {
    it('should create MediaNode from items array', () => {
      const result = MediaNode.from([{ src: 'https://example.com/image.jpg', alt: 'Test image' }]);
      expect(result).toBeInstanceOf(MediaNode);
      expect(result.type).toBe('media');
      expect(result.items[0].src).toBe('https://example.com/image.jpg');
      expect(result.items[0].alt).toBe('Test image');
    });

    it('should create MediaNode with gridStyle', () => {
      const result = MediaNode.from(
        [
          { key: 'img1', src: 'https://example.com/1.jpg' },
          { key: 'img2', src: 'https://example.com/2.jpg' },
        ],
        { rows: '1fr', cols: 'repeat(2, 1fr)' },
      );
      expect(result.items).toHaveLength(2);
      expect(result.gridStyle?.rows).toBe('1fr');
      expect(result.gridStyle?.cols).toBe('repeat(2, 1fr)');
    });
  });

  describe('multiple items', () => {
    it('should create MediaNode with multiple items', () => {
      const items = [
        { key: 'img1', src: 'https://example.com/1.jpg' },
        { key: 'img2', src: 'https://example.com/2.jpg' },
        { key: 'img3', src: 'https://example.com/3.jpg' },
      ];
      const node = new MediaNode(items);
      expect(node.items).toHaveLength(3);
      expect(node.items[0].key).toBe('img1');
      expect(node.items[1].key).toBe('img2');
      expect(node.items[2].key).toBe('img3');
    });

    it('should create MediaNode with grid layout items', () => {
      const items = [
        { key: 'img1', src: 'https://example.com/1.jpg', gridRow: '1/2', gridColumn: '1/3' },
        { key: 'img2', src: 'https://example.com/2.jpg', gridRow: '2/3', gridColumn: '1/2' },
        { key: 'img3', src: 'https://example.com/3.jpg', gridRow: '2/3', gridColumn: '2/3' },
      ];
      const gridStyle = { rows: 'repeat(2, 1fr)', cols: 'repeat(2, 1fr)' };
      const node = new MediaNode(items, gridStyle);
      expect(node.items[0].gridRow).toBe('1/2');
      expect(node.items[0].gridColumn).toBe('1/3');
      expect(node.gridStyle).toEqual(gridStyle);
    });
  });

  describe('width and height attributes', () => {
    it('should accept width and height attributes', () => {
      const node = MediaNode.from([
        { src: 'https://example.com/image.jpg', width: 800, height: 600 },
      ]);
      expect(node.items[0].width).toBe(800);
      expect(node.items[0].height).toBe(600);
    });

    it('should handle optional width and height', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg' }]);
      expect(node.items[0].width).toBeUndefined();
      expect(node.items[0].height).toBeUndefined();
    });

    it('should handle width only', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg', width: 800 }]);
      expect(node.items[0].width).toBe(800);
      expect(node.items[0].height).toBeUndefined();
    });

    it('should handle height only', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg', height: 600 }]);
      expect(node.items[0].width).toBeUndefined();
      expect(node.items[0].height).toBe(600);
    });
  });

  describe('boundary values', () => {
    it('should handle empty items array', () => {
      const node = MediaNode.from([]);
      expect(node.items).toHaveLength(0);
      expect(node.type).toBe('media');
    });

    it('should handle empty items array with gridStyle', () => {
      const node = MediaNode.from([], { rows: '1fr', cols: '1fr' });
      expect(node.items).toHaveLength(0);
      expect(node.gridStyle?.rows).toBe('1fr');
    });

    it('should handle width of 0', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg', width: 0 }]);
      expect(node.items[0].width).toBe(0);
    });

    it('should handle height of 0', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg', height: 0 }]);
      expect(node.items[0].height).toBe(0);
    });

    it('should handle width of 1', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg', width: 1 }]);
      expect(node.items[0].width).toBe(1);
    });

    it('should handle large width value', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg', width: 10000 }]);
      expect(node.items[0].width).toBe(10000);
    });

    it('should handle negative width value', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg', width: -100 }]);
      expect(node.items[0].width).toBe(-100);
    });

    it('should handle empty string src', () => {
      const node = MediaNode.from([{ src: '' }]);
      expect(node.items[0].src).toBe('');
    });

    it('should handle many items', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        key: `img${i}`,
        src: `https://example.com/${i}.jpg`,
      }));
      const node = MediaNode.from(items);
      expect(node.items).toHaveLength(100);
      expect(node.items[0].key).toBe('img0');
      expect(node.items[99].key).toBe('img99');
    });

    it('should handle empty string gridStyle values', () => {
      const node = MediaNode.from([{ src: 'https://example.com/image.jpg' }], {
        rows: '',
        cols: '',
      });
      expect(node.gridStyle?.rows).toBe('');
      expect(node.gridStyle?.cols).toBe('');
    });

    it('should handle items with empty optional fields', () => {
      const node = MediaNode.from([
        {
          src: 'https://example.com/image.jpg',
          key: '',
          alt: '',
          caption: '',
          className: '',
          gridRow: '',
          gridColumn: '',
        },
      ]);
      expect(node.items[0].key).toBe('');
      expect(node.items[0].alt).toBe('');
      expect(node.items[0].caption).toBe('');
    });
  });
});
