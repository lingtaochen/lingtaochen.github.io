globalThis.researchData = {
  introduction: "I develop computational methods to study how proteins interact. My work combines machine learning and molecular simulations to predict binding affinity and investigate how disease-associated variants affect protein structure.",
  topics: [
    {
      id: "binding-affinity",
      title: "Protein–protein binding affinity prediction",
      summary: "In 2024, we compared convolutional and transformer models that predict binding affinity from amino acid sequences. The strongest versions had similar errors under different test conditions, and the transformer performed worse when longer sequences were included. In 2025, we built a separate workflow that automates molecular dynamics analysis and uses a 3D CNN to estimate affinity from simulation snapshots, which we demonstrated on the human urate transporter GLUT9.",
      figures: [
        {
          src: "assets/images/research/molecular-dynamics-affinity-2025/figure-01-workflow.png",
          alt: "Workflow linking protein structure preparation, molecular dynamics, trajectory analysis, and binding affinity prediction.",
          caption: "2025, Figure 1. Workflow for automated simulation analysis and binding affinity prediction.",
          paperId: "IjCSPb-OGe4C",
        },
        {
          src: "assets/images/research/molecular-dynamics-affinity-2025/figure-02-cnn-architecture.png",
          alt: "Three-branch CNN that combines a voxel grid, a contact map, and a distance map to predict affinity.",
          caption: "2025, Figure 2. CNN developed for the molecular dynamics workflow to estimate binding affinity from structural inputs.",
          paperId: "IjCSPb-OGe4C",
        },
        {
          src: "assets/images/research/sequence-affinity-2024/figure-02-cnn-architecture.png",
          alt: "Diagram of the 2024 CNN that combines multiple sequence-derived features for affinity prediction.",
          caption: "2024, Figure 2. CNN architecture using features derived from protein sequences.",
          paperId: "UeHWp8X0CEIC",
        },
        {
          src: "assets/images/research/sequence-affinity-2024/figure-03-transformer-architecture.png",
          alt: "Diagram of the 2024 Transformer and its attention layers for sequence-based affinity prediction.",
          caption: "2024, Figure 3. Transformer architecture for predicting affinity from protein sequences.",
          paperId: "UeHWp8X0CEIC",
        },
      ],
      paperIds: ["UeHWp8X0CEIC", "IjCSPb-OGe4C"],
    },
    {
      id: "sox17-variants",
      title: "Structural analysis of disease-associated SOX17 variants",
      summary: "We used structure prediction and molecular dynamics to study two SOX17 variants associated with pulmonary arterial hypertension. One variant became more compact in simulations while the other lost structural stability, consistent with their opposite effects on transcriptional activity in our collaborators’ experiments. The simulations modeled isolated SOX17, leaving direct protein–DNA interactions for future work.",
      figures: [
        {
          src: "assets/images/research/sox17-variants-2026/figure-03-structural-comparison.png",
          alt: "Two rows comparing predicted and simulated structures of wild-type SOX17 and two variants, with aligned views.",
          caption: "Figure 3. Initial structure predictions (top) and structures after molecular dynamics simulation (bottom).",
          paperId: "WF5omc3nYNoC",
        },
        {
          src: "assets/images/research/sox17-variants-2026/figure-02-transcriptional-activity.png",
          alt: "Bar chart of measured SOX17 transcriptional activity for the wild type and two variants.",
          caption: "Figure 2. Collaborators’ luciferase measurements show opposite changes in transcriptional activity for the two variants.",
          paperId: "WF5omc3nYNoC",
        },
        {
          src: "assets/images/research/sox17-variants-2026/figure-01-workflow.png",
          alt: "Workflow diagram linking structure prediction, molecular dynamics, and comparison with experimental observations.",
          caption: "Figure 1. Study workflow from structure prediction and simulation to comparison with experimental observations.",
          paperId: "WF5omc3nYNoC",
        },
      ],
      paperIds: ["WF5omc3nYNoC"],
    },
    {
      id: "protein-structure-review",
      title: "AI methods for protein structure prediction",
      summary: "I co-wrote a review of how protein structure prediction progressed from methods such as homology modeling and threading to deep learning systems such as AlphaFold and RoseTTAFold. We compared reported results from CASP14 and CASP15 and explained how researchers assess prediction accuracy and confidence.",
      figures: [
        {
          src: "assets/images/research/protein-structure-review-2024/figure-01-review-overview.png",
          alt: "Flowchart outlining the review’s sections on established methods, deep learning, and applications.",
          caption: "Figure 1. The review covers established modeling methods, deep learning approaches, and applications.",
          paperId: "2osOgNQ5qMEC",
        },
        {
          src: "assets/images/research/protein-structure-review-2024/figure-04-predicted-vs-experimental.png",
          alt: "Experimental and AlphaFold2-predicted structures, with an overlay and close-ups of selected regions.",
          caption: "Figure 4. Experimental and AlphaFold2-predicted structures, with close-ups showing where they differ.",
          paperId: "2osOgNQ5qMEC",
        },
      ],
      paperIds: ["2osOgNQ5qMEC"],
    },
    {
      id: "sepsis-length-of-stay",
      title: "Earlier work: predicting hospital stay for patients with sepsis",
      summary: "We used process mining to reconstruct hospital stays from anonymized event logs and compared six machine learning methods for predicting length of stay. LightGBM had the lowest mean absolute error both with and without outliers in the dataset.",
      figures: [
        {
          src: "assets/images/research/sepsis-length-of-stay/figure-02-data-workflow.png",
          alt: "Flowchart from the sepsis event logs through case exclusion to training and testing groups, with and without outliers.",
          caption: "Figure 2. How the study filtered cases and split the data for training and testing.",
          paperId: "u5HHmVD_uO8C",
        },
        {
          src: "assets/images/research/sepsis-length-of-stay/figure-03-care-pathway.png",
          alt: "Process map showing the events in a median-duration sepsis hospital stay.",
          caption: "Figure 3. Care pathway reconstructed with process mining for a median-duration case.",
          paperId: "u5HHmVD_uO8C",
        },
        {
          src: "assets/images/research/sepsis-length-of-stay/figure-07-prediction-error.png",
          alt: "Bar chart of mean absolute error for six models with and without outliers. LightGBM has the lowest error in both comparisons.",
          caption: "Figure 7. Mean absolute prediction error for the six methods, with and without outliers.",
          paperId: "u5HHmVD_uO8C",
        },
      ],
      paperIds: ["u5HHmVD_uO8C"],
    },
  ],
  figureCredits: {
    "IjCSPb-OGe4C": {
      notice: "© 2025 IEEE. Cropped from the published figure.",
      source: "https://doi.org/10.1109/ICTAI66417.2025.00045",
    },
    "UeHWp8X0CEIC": {
      notice: "© 2024 IEEE. Cropped from the published figure.",
      source: "https://doi.org/10.1109/ICTAI62512.2024.00083",
    },
    "WF5omc3nYNoC": {
      notice: "© 2026 IEEE. Cropped from the published figure.",
      source: "https://doi.org/10.1109/ICHI69079.2026.00077",
    },
    "2osOgNQ5qMEC": {
      notice: "© 2024 Chen et al. Cropped from the published figure.",
      source: "https://doi.org/10.3390/ijms25158426",
      license: "https://creativecommons.org/licenses/by/4.0/",
    },
    "u5HHmVD_uO8C": {
      notice: "© 2022 IEEE. Cropped from the published figure.",
      source: "https://doi.org/10.1109/SoutheastCon48659.2022.9764052",
    },
  },
  currentProjects: [
    {
      title: "Explainable AI for protein binding",
      status: "Under submission",
      summary: "I’m developing explainable machine learning methods for predicting protein–protein binding affinity, with a focus on helping researchers interpret individual predictions.",
    },
    {
      title: "Drug repurposing with large language models",
      status: "In progress",
      summary: "I’m using large language models to identify possible biological mechanisms that connect existing drugs to diseases and generate hypotheses for drug repurposing.",
    },
    {
      title: "Further simulations of SOX17 variants",
      status: "In progress",
      summary: "We’re extending our SOX17 study with additional molecular dynamics simulations to examine how variants associated with pulmonary arterial hypertension affect protein structure and stability.",
    },
  ],
};
