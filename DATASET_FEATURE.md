# Custom RAG Dataset Feature

## Overview

The Custom RAG Dataset feature allows you to add reference content (transcripts, documentation, examples, etc.) that will be automatically incorporated into your prompts when optimizing. This provides context-aware prompt enhancement without requiring external vector databases or AI APIs.

## Features

✅ **Add Custom Datasets**
- Paste any text content (transcripts, docs, examples)
- Name your datasets for easy reference
- Add optional descriptions
- Automatic token counting

✅ **LocalStorage Persistence**
- Datasets stored in browser localStorage
- Survives page refreshes
- No database required
- Privacy-first (data never leaves your browser)

✅ **Smart Context Injection**
- Automatically detects when prompts need context
- Keywords: "based on", "using", "from", "like", "in the style of", "similar to", "context", "examples"
- Truncates content to prevent token overflow
- Adds context in optimal format for each platform

✅ **Dataset Management**
- View all saved datasets
- Select active dataset with one click
- Delete datasets you no longer need
- See token counts and creation dates

## How to Use

### 1. Adding a Dataset

1. Navigate to the **Dashboard**
2. Find the **RAG Datasets** card in the left column
3. Click **"+ New Dataset"**
4. Fill in the form:
   - **Dataset Name**: e.g., "Alex Hormozi Transcripts"
   - **Description** (optional): Brief description of the content
   - **Content**: Paste your reference material
5. Click **"Save Dataset"**

The dataset is now stored in localStorage and ready to use!

### 2. Using a Dataset

1. Click on any saved dataset card to **activate it**
2. The active dataset will show a green "Active" badge
3. Enter your prompt as normal
4. Click **"Optimize Prompt"**
5. The dataset content will automatically be included as context

### 3. Deactivating a Dataset

- Click the active dataset card again to deselect it
- Or select a different dataset to switch

### 4. Deleting a Dataset

- Click the 🗑️ (trash) icon on any dataset card
- Confirm the deletion
- The dataset will be permanently removed from localStorage

## Use Cases

### Marketing Content in Brand Voice

**Dataset**: Company marketing materials, past campaigns, brand guidelines

**Prompt**: "Write a product launch email in our brand style"

**Result**: The enhanced prompt will include your brand's voice and examples, ensuring consistency.

---

### Code in Specific Framework Style

**Dataset**: Codebase examples, framework documentation, coding standards

**Prompt**: "Create a React component for user authentication"

**Result**: Generated code follows your project's patterns and conventions.

---

### Writing Like a Specific Person

**Dataset**: Transcripts of Alex Hormozi videos, blog posts, speaking style

**Prompt**: "Write advice about business growth like Alex Hormozi"

**Result**: Content matches the communication style and principles from the dataset.

---

### Technical Documentation

**Dataset**: API documentation, technical specifications, architecture diagrams

**Prompt**: "Explain how to implement OAuth in our system"

**Result**: Accurate implementation guide based on your actual system architecture.

---

### Customer Support Templates

**Dataset**: Past support conversations, FAQ answers, resolution patterns

**Prompt**: "Respond to a customer asking about refund policy"

**Result**: Consistent, on-brand response using proven templates.

## Technical Details

### Storage

- **Location**: Browser localStorage
- **Key**: `hermes_datasets`
- **Format**: JSON array of dataset objects
- **Size Limit**: ~5-10MB (browser dependent)

### Dataset Schema

```typescript
interface Dataset {
  id: string;              // Unique identifier
  name: string;            // Dataset name
  content: string;         // The actual content
  description?: string;    // Optional description
  createdAt: Date;         // Creation timestamp
  tokenCount: number;      // Approximate token count
}
```

### Context Injection Logic

1. **Check if dataset is selected**: If no dataset, skip
2. **Analyze prompt for context keywords**: Look for phrases like "based on", "using", "like", etc.
3. **Smart truncation**:
   - If context keywords found: Use up to 3000 characters
   - Otherwise: Use up to 2000 characters
4. **Format injection**:
   - With keywords: `Context/Reference Material:\n{content}\n\n---\n\nTask: {prompt}`
   - Without keywords: `[The following context is available for reference]\n{content}\n\n{prompt}`

### Token Optimization

- Content is automatically truncated to prevent exceeding platform token limits
- Larger datasets are intelligently summarized
- Token counter shows total including dataset content

## Example Workflow

### Alex Hormozi Marketing Copy

```
1. Create dataset:
   Name: "Alex Hormozi Content"
   Content: [Paste transcripts from 5+ videos]

2. Activate the dataset by clicking it

3. Enter prompt: "Write an ad for my coaching program using Alex's style"

4. Click "Optimize Prompt"

5. Enhanced versions include:
   - Hormozi's speaking patterns
   - Common frameworks (value equation, etc.)
   - Characteristic phrases and tonality
   - Sales psychology principles he uses
```

**Original Prompt** (55 quality score):
```
Write an ad for my coaching program using Alex's style
```

**Enhanced with Dataset** (85+ quality score):
```
Context/Reference Material:
[First 3000 chars of Alex Hormozi transcripts containing his frameworks,
tonality, common phrases, value propositions, etc.]

---

Task: Write an ad for my coaching program using Alex's style

Tone: Direct, no-fluff approach
Focus on: Value creation, transformative outcomes, specific frameworks
Style: Short punchy sentences, clear value proposition, calls to action
```

## Limitations

### Storage
- Limited by browser localStorage (typically 5-10MB)
- Cleared if browser data is cleared
- Not synced across devices (local only)

### Token Limits
- Large datasets are truncated to fit platform limits
- First 2000-3000 characters used for context
- Consider splitting very large datasets

### No Vector Search
- Simple text inclusion, not semantic search
- No embedding or similarity matching
- Full content is provided (truncated if needed)

## Best Practices

### 1. Keep Datasets Focused
- One dataset per topic/style/source
- Better to have multiple small datasets than one huge one
- Easier to select the right context for each prompt

### 2. Name Datasets Clearly
- Use descriptive names: "Q4 2024 Marketing Campaigns" not "Marketing"
- Include dates for time-sensitive content
- Tag by source: "Alex Hormozi Podcasts", "Company Blog Posts"

### 3. Update Regularly
- Delete outdated datasets
- Add new content as it becomes available
- Keep descriptions current

### 4. Optimize Content
- Remove irrelevant information before adding
- Keep only the most useful examples and patterns
- Quality over quantity

### 5. Test Different Datasets
- Try different datasets for the same prompt
- See which provides better context
- Refine based on results

## Privacy & Security

✅ **All data stays local**
- Datasets never sent to external servers
- Stored only in your browser
- Deleted when you clear browser data

✅ **No tracking**
- No analytics on dataset content
- No usage telemetry
- Completely private

⚠️ **Backup Considerations**
- Export important datasets manually (copy content)
- Not automatically backed up
- Lost if browser data is cleared

## Future Enhancements

Potential improvements (not yet implemented):

- [ ] Export/Import datasets as JSON
- [ ] Share datasets between team members
- [ ] Vector embeddings for semantic search
- [ ] Automatic chunking for large datasets
- [ ] Dataset versioning and history
- [ ] Cloud sync (optional)
- [ ] Dataset templates for common use cases
- [ ] Merge multiple datasets
- [ ] Smart excerpt selection based on prompt

## Troubleshooting

### Dataset Not Appearing

**Issue**: Saved dataset doesn't show up

**Solutions**:
1. Refresh the page
2. Check browser console for errors
3. Try clearing localStorage and re-adding
4. Ensure JavaScript is enabled

### Content Truncated

**Issue**: Only part of dataset appears in enhanced prompt

**This is expected**:
- Large datasets are automatically truncated
- Prevents exceeding platform token limits
- First 2000-3000 characters used
- Consider splitting into multiple datasets

### LocalStorage Full

**Issue**: Can't save new dataset

**Solutions**:
1. Delete unused datasets
2. Remove old browser data
3. Use shorter content
4. Split into multiple smaller datasets

### Dataset Not Being Used

**Issue**: Enhanced prompt doesn't include dataset content

**Check**:
1. Is the dataset selected (Active badge visible)?
2. Click the dataset card to activate it
3. Only one dataset can be active at a time
4. Refresh if needed

---

## Example: Alex Hormozi Sales Copy Generator

### Step 1: Create Dataset

```
Name: Alex Hormozi Sales Framework
Description: Transcripts from Hormozi videos covering sales, value, offers

Content:
[Paste 50-100 paragraphs from transcripts covering:]
- Value equation framework
- Offer creation principles
- Pricing psychology
- Sales psychology
- Common phrases ("make people an offer so good they feel stupid saying no")
- Framework examples
- Case studies
```

### Step 2: Activate & Use

**Prompt**: "Create a sales page for my $997 course on email marketing"

**Enhanced Result**:
- Includes value equation framework
- Uses Hormozi's tonality
- Applies pricing psychology
- Structures offer components correctly
- Uses characteristic phrases
- Maintains his direct style

### Step 3: Iterate

Try different prompts:
- "Write ad copy for cold traffic"
- "Create urgency-driven email sequence"
- "Explain my guarantee using Alex's method"

Each will pull relevant context from your dataset!

---

**Pro Tip**: Start with a small, focused dataset (5-10 examples) and expand as needed. Quality over quantity!
