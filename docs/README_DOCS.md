# System Architecture

This document outlines the architectural diagrams and data flow for the Data Structures & Algorithms Visualizer.

## 1. High-Level Architecture Diagram

This diagram shows how major components of your application are structured and interact with each other.

```mermaid
flowchart TB
    User["User (Browser)"]
    
    subgraph Frontend
        UI["UI Components"]
        Controls["Control Panel"]
        Visual["Visualization Components"]
    end

    subgraph State_Management
        Store["Zustand Store"]
    end

    subgraph Core_Logic
        Algo["Algorithm Engine"]
        Steps["Step Generator"]
        Animation["Animation Engine"]
    end

    subgraph Rendering
        Canvas["Canvas Renderer"]
        SVG["SVG Renderer"]
    end

    User --> UI
    UI --> Controls
    Controls --> Store
    Store --> Algo
    Algo --> Steps
    Steps --> Animation
    Animation --> Canvas
    Animation --> SVG
    Canvas --> Visual
    SVG --> Visual
    Visual --> UI
```

**Explanation:**
- **React Components** manage the UI and interact with user controls.
- **Zustand** centralizes application state (current animation step, speeds, selected algorithm).
- **Algorithm Engine** defines data structure operations and yields abstract "steps" representing their logic, separate from visuals.
- **Animation Engine** interprets those steps into animations using either SVG (for trees/graphs) or Canvas (for sorting and arrays).
- **Hosted** as a static site (Vercel deployment).

## 2. Data Flow Diagram (Level 1)

This shows how data moves through the system.

```mermaid
flowchart LR
    User -->|Select Algorithm| UI
    UI -->|Dispatch Action| Store
    Store -->|Trigger| Algorithm
    Algorithm -->|Generate Steps| StepQueue
    StepQueue -->|Feed| AnimationEngine
    AnimationEngine --> Renderer
    Renderer --> Display
```

**Highlights:**
- Algorithm logic generates step sequences instead of immediate UI changes — a clean separation.
- Animation engine interprets steps to draw UI visuals.

## 3. Sequence Diagram (When User Clicks "Start")

Shows the timing when an algorithm is started:

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI Controls
    participant S as Zustand Store
    participant A as Algorithm Engine
    participant AN as Animation Engine
    participant R as Renderer

    U->>UI: Click Start
    UI->>S: Update State (running=true)
    S->>A: Trigger Algorithm
    A->>A: Generate Step List
    A->>AN: Send Steps
    AN->>R: Animate Step
    R->>UI: Update Visualization
```

**Shows timing:**
- UI control triggers state update.
- Algorithm logic yields ordered sequence of logical steps.
- Animation engine interprets those steps via renderer.

## 4. Component Dependency Diagram

Code organization view:

```mermaid
graph TD
    App --> Layout
    Layout --> Sidebar
    Layout --> VisualArea

    VisualArea --> SortingModule
    VisualArea --> TreeModule
    VisualArea --> GraphModule
    VisualArea --> LinkedListModule

    SortingModule --> AlgorithmLibrary
    TreeModule --> AlgorithmLibrary
    GraphModule --> AlgorithmLibrary

    AlgorithmLibrary --> AnimationEngine
    AnimationEngine --> Renderer
```

**Note:** Separation ensures testability & modular updates; e.g., new DSA logic can be plugged in without touching UI code.

## 5. State Diagram (Visualization Lifecycle)

Visualizes the different states during execution:

```mermaid
stateDiagram-v2
    [*] --> Stopped
    Stopped --> Running : Start
    Running --> Paused : Pause
    Paused --> Running : Resume
    Running --> Stopped : Stop
    Paused --> Stopped : Reset
```

## 6. Deployment Architecture (Vercel)

Vercel builds React + Vite front-end as static assets and serves globally as a high-performance SPA.

```mermaid
flowchart TB
    Developer[Developer]
    GitHub[GitHub Repository]
    Vercel[Vercel CI/CD]
    CDN[Global CDN]
    Users[End Users]

    Developer -->|Push Code| GitHub
    GitHub -->|Auto Deploy| Vercel
    Vercel -->|Build Static Assets| CDN
    CDN -->|Serve| Users
```

## 7. Clean UML Class Diagram (Conceptual)

Logic & state relationships:

```mermaid
classDiagram
    class AlgorithmGenerator {
        +generateSteps()
    }

    class SortingAlgorithm {
        +bubbleSort()
        +quickSort()
        +mergeSort()
    }

    class AnimationEngine {
        +play()
        +pause()
        +stepForward()
        +stepBackward()
    }

    class Renderer {
        +drawArray()
        +drawTree()
        +drawGraph()
    }

    AlgorithmGenerator <|-- SortingAlgorithm
    SortingAlgorithm --> AnimationEngine
    AnimationEngine --> Renderer
```

