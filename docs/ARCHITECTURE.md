# Architecture & Data Flow

## One-look architecture map
```mermaid
flowchart TD
  subgraph pages
    IDX[index.tsx\nPage Controller]
  end

  subgraph components
    HDR[Header.tsx]
    LPM[LocationPromptModal.tsx]
    CC[CategoryChips.tsx]
    PCR[PlaceCardRow.tsx]
    MAP[MapView.tsx]
  end

  subgraph lib
    ION[isOpenNow.ts]
    CTG[categories.ts]
    TYP[types.ts]
    DST[distance.ts]
  end

  subgraph data
    PLJ[places.json]
  end

  IDX --> CC
  IDX --> PCR
  IDX --> MAP
  IDX --> HDR
  IDX --> LPM

  IDX -. uses .-> ION
  PCR -. uses .-> CTG
  MAP -. uses .-> CTG
  IDX --> PLJ
  PCR -. optional .-> DST
```

## Data flow & filtering
```mermaid
flowchart LR
  PLJ[places.json] --> IDX[index.tsx]
  IDX -->|1. isOpenNow(Detroit)| OPEN[openNow[]]
  OPEN -->|2. search| SEARCHED[searched[]]
  SEARCHED -->|3. category chips| VISIBLE[visible[]]

  VISIBLE --> CC[CategoryChips]
  VISIBLE --> LIST[List of PlaceCardRow]
  VISIBLE --> MAP[MapView]
```

## Filter state machine
```mermaid
stateDiagram-v2
  [*] --> OpenNow
  OpenNow: p => isOpenNow(p.opens_at, p.closes_at, { tz: "America/Detroit" })
  OpenNow --> Search: on query change
  Search: p => matchesQuery(p, q)
  Search --> Category: on chip change
  Category: p => selectedCat === "All" ? true : p.category === selectedCat
  Category --> RenderList: view == "list"
  Category --> RenderMap: view == "map"
```
