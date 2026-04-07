# Spec Editor UI - Quick Start Guide

**Version**: 1.0  
**Date**: April 7, 2026

---

## 🚀 Quick Start

### 1. Access the Spec Editor

From the main SpecLens app:
1. Launch the app: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click the **"✏️ Editor"** button (bottom right)

The Spec Editor will open in full screen with 3 panels.

### 2. Create Your First Spec

#### Option A: Start from a Template
1. Click "Load Template..." in the header
2. Select "Grid Layout"
3. The template spec loads into the editor
4. Watch the preview update instantly
5. Check the dev panel for metrics

#### Option B: Write Your Own
1. Paste JSON into the editor
2. The editor validates in real-time
3. Valid specs appear in the preview
4. Invalid JSON shows errors

### 3. Edit and Preview

The 3-panel layout works as follows:

```
┌─────────────┬─────────────┬──────────────┐
│   Editor    │   Preview   │  Dev Panel   │
│             │             │              │
│ 1. Edit     │ 2. Renders  │ 3. Metrics   │
│    JSON     │    spec     │    & Tree    │
│             │             │              │
└─────────────┴─────────────┴──────────────┘
```

**Workflow:**
1. **Left (Editor)**: Edit JSON spec
2. **Center (Preview)**: See rendered UI
3. **Right (DevPanel)**: Monitor performance metrics

### 4. Understand the Metrics

**MetricsSummary Cards:**
- 📊 **Total Renders**: Count of all component renders in current session
- 🏆 **Most Rendered**: Component that rendered most times
- ⏱️ **Avg Duration**: Average render time (ms)
- 🎯 **Render Reason**: Most common reason for re-renders

**ComponentTreeView:**
- Shows hierarchical component structure
- 🔄 Blue: Props changed
- ⚡ Yellow: Parent re-rendered
- 🎯 Orange: State change
- 📦 Purple: Context change
- ⭐ Green: Initial render

### 5. Save Your Spec

1. Edit the JSON in the editor
2. Dirty indicator (red dot) appears next to title
3. Click "Save" when ready
4. Spec persists to browser storage

---

## 📝 Example Specs

### Simple Cards Grid

```json
{
  "type": "Grid",
  "props": { "columns": 2, "gap": 16 },
  "children": [
    {
      "type": "Card",
      "props": { "title": "Card 1" }
    },
    {
      "type": "Card",
      "props": { "title": "Card 2" }
    }
  ]
}
```

### Metrics Dashboard

```json
{
  "type": "Grid",
  "props": { "columns": 4, "gap": 16 },
  "children": [
    {
      "type": "StatCard",
      "props": { "value": 1200, "label": "Users", "trend": "up" }
    },
    {
      "type": "StatCard",
      "props": { "value": 420, "label": "Revenue", "trend": "up" }
    }
  ]
}
```

### Nested Layout

```json
{
  "type": "Grid",
  "props": { "columns": 2 },
  "children": [
    {
      "type": "Card",
      "props": { "title": "Group 1" },
      "children": [
        { "type": "Card", "props": { "title": "Child 1" } },
        { "type": "Card", "props": { "title": "Child 2" } }
      ]
    }
  ]
}
```

---

## 🎨 Features

### Editor Features
- ✅ JSON syntax highlighting
- ✅ Real-time validation
- ✅ Format button (prettify JSON)
- ✅ Clear button (reset editor)
- ✅ Line count display
- ✅ Error display with line numbers

### Preview Features
- ✅ Live rendering of valid specs
- ✅ Error boundary (graceful crashes)
- ✅ Independent scrolling
- ✅ Placeholder for empty specs

### Dev Panel Features
- ✅ Real-time metrics (updated every 500ms)
- ✅ Component tree with hierarchy
- ✅ Render reason color coding
- ✅ Render count badges
- ✅ Expandable/collapsible nodes

### Layout Features
- ✅ Resizable columns (drag dividers)
- ✅ Column widths persist on reload
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Independent scrolling per panel
- ✅ Dark theme with smooth transitions

---

## ⌨️ Tips & Tricks

### Keyboard Shortcuts
- **Ctrl+S** / **Cmd+S**: Save spec
- **Format button**: Prettify JSON (also: Ctrl+K Ctrl+F / Cmd+K Cmd+F)

### Editor Tips
- Don't forget the `type` field - it's required
- Use `children: []` for empty containers
- Props are passed directly to components
- IDs help with debugging in dev panel
- Quotation marks around property names are required

### Performance Tips
- Avoid deeply nested specs (10+ levels)
- Limit children count for smooth rendering
- Keep prop values simple (strings, numbers, booleans)
- Use the metrics to identify slow components

---

## 🐛 Common Issues

### "Invalid Spec" Error
**Problem**: Red error message in preview  
**Solution**: Check the editor errors - look for missing commas, quotes, or brackets

### Metrics Not Updating
**Problem**: Dev panel shows no data  
**Solution**: Make sure spec is valid and renderable. Invalid specs don't track.

### Preview Blank
**Problem**: Preview area is empty  
**Solution**: Load a template or paste a valid spec. Empty editor shows placeholder.

### Resizing Broken
**Problem**: Columns won't resize  
**Solution**: Reload the page. Clear cache if needed.

---

## 📚 Built-in Templates

1. **Empty Spec**: Start with blank Grid
2. **Grid Layout**: 3-column card layout
3. **Dashboard**: 4-column metric cards
4. **Nested Layout**: 2 groups with nested cards

Load any template from "Load Template..." dropdown.

---

## 🔗 Integration Points

The Spec Editor integrates with:

1. **RenderTracker**: Auto-tracks all rendered components
2. **SpecRenderer**: Renders specs from JSON
3. **Component Registry**: Uses all registered components
4. **Main App**: Accessible via editor button

---

## 📖 Learn More

- **Full Specification**: See [SPEC_EDITOR_UI_SPEC.md](./specs/SPEC_EDITOR_UI_SPEC.md)
- **Implementation Details**: See [SPEC_EDITOR_IMPLEMENTATION_COMPLETE.md](./SPEC_EDITOR_IMPLEMENTATION_COMPLETE.md)
- **Task Checklist**: See [SPEC_EDITOR_TASK_CHECKLIST.md](./SPEC_EDITOR_TASK_CHECKLIST.md)
- **Architecture Guide**: See [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)

---

## 🎯 Next Steps

After exploring the Spec Editor:

1. ✅ Load a template and edit it
2. ✅ Watch metrics update in real-time
3. ✅ Resize the panels to your liking
4. ✅ Try the component tree navigation
5. ✅ Create your own spec from scratch

---

**Happy Speccing! 🚀**
