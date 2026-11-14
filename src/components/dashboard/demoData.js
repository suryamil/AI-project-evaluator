// Realistic demo evaluation data for student AI projects
export const DEMO_PROJECTS = [
  {
    id: 'demo_101',
    isDemo: true,
    title: 'Drone Crop Disease Classifier on Raspberry Pi 4',
    domain: 'Computer Vision',
    model: 'YOLOv8x (68.2M Parameters)',
    dataset: '1,500 Field Photos (Unbalanced Classes)',
    hardware: 'Raspberry Pi 4 (4GB RAM, CPU-only)',
    feasibilityScore: 42,
    riskLevel: 'High Risk',
    riskColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    primaryRisk: 'Inference latency (>4,200ms/frame) causes drone collision risk; severe class imbalance in bacterial blight labels.',
    fixes: [
      'Downscale architecture to YOLOv8n (Nano) with only 3.2M parameters (~18 FPS on Pi 4).',
      'Quantize weights to INT8 using OpenVINO / ONNX Runtime.',
      'Augment rare pathology classes with synthetic diffusion transformations.'
    ],
    evaluatedAt: '2026-11-04 10:30 AM',
    vramRequired: '3.8 GB RAM',
    cloudEstimate: '$0 (Edge deployment)'
  },
  {
    id: 'demo_102',
    isDemo: true,
    title: 'Legal Contract Cross-Clause RAG QA Engine',
    domain: 'Natural Language Processing',
    model: 'LLaMA-3-8B-Instruct + Qdrant Vector DB',
    dataset: '45,000 SEC & Employment Agreements',
    hardware: 'Single NVIDIA RTX 3060 (12GB VRAM)',
    feasibilityScore: 78,
    riskLevel: 'Moderate Risk',
    riskColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    primaryRisk: 'FP16 LLaMA-3 requires ~16GB VRAM, resulting in CUDA Out-of-Memory on 12GB GPU during batch re-ranking.',
    fixes: [
      'Deploy 4-bit AWQ or GGUF quantization (reduces VRAM requirement to ~6.5GB).',
      'Use hierarchical chunking (512 tokens with 64 token overlap) with BM25 hybrid search.'
    ],
    evaluatedAt: '2026-11-03 04:15 PM',
    vramRequired: '16.2 GB (FP16)',
    cloudEstimate: '$45 / month (AWS g5.xlarge)'
  },
  {
    id: 'demo_103',
    isDemo: true,
    title: 'Hospital Bedside ICU Arrhythmia Predictor',
    domain: 'Time-Series & Biomedical',
    model: '1D-ResNet + Multi-Head Attention',
    dataset: 'MIT-BIH Arrhythmia Database (109,000 Heartbeats)',
    hardware: 'ARM Cortex-M Embedded Board',
    feasibilityScore: 89,
    riskLevel: 'Low Risk',
    riskColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    primaryRisk: 'Subject-wise data leakage if patient records are split randomly instead of patient-grouped cross-validation.',
    fixes: [
      'Enforce GroupKFold split strictly by Patient ID to guarantee unbiased generalization.',
      'Convert 1D-ResNet layers to CMSIS-NN C-kernels for microcontroller acceleration.'
    ],
    evaluatedAt: '2026-11-01 02:40 PM',
    vramRequired: '180 KB SRAM',
    cloudEstimate: '$0 (Embedded MCU)'
  },
  {
    id: 'demo_104',
    isDemo: true,
    title: 'Real-Time Stock Volatility Forecasting with LSTMs',
    domain: 'Quantitative Finance',
    model: 'Stacked Bi-LSTM + LightGBM Residual',
    dataset: '5 Years Tick-Level Order Book Quotes (50GB)',
    hardware: 'Google Colab Pro (T4 GPU)',
    feasibilityScore: 34,
    riskLevel: 'High Risk',
    riskColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    primaryRisk: 'Lookahead bias in feature normalization; simulated slippage and trading fees erase predicted alpha.',
    fixes: [
      'Implement expanding-window purged cross-validation.',
      'Add realistic 5-basis-point exchange slippage and transaction cost models.'
    ],
    evaluatedAt: '2026-10-29 11:20 AM',
    vramRequired: '8.4 GB',
    cloudEstimate: '$90 / month'
  },
  {
    id: 'demo_105',
    isDemo: true,
    title: 'Multilingual Speech-to-Text for Regional Dialects',
    domain: 'Audio & Speech',
    model: 'OpenAI Whisper-Small Fine-Tuned',
    dataset: '200 Hours Hindi/Tamil Audio Transcriptions',
    hardware: 'NVIDIA RTX 4090 (24GB VRAM)',
    feasibilityScore: 82,
    riskLevel: 'Low Risk',
    riskColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    primaryRisk: 'Phonetic drift on noisy low-bitrate microphone inputs.',
    fixes: [
      'Apply SpecAugment frequency masking and background urban noise injections.',
      'Use LoRA fine-tuning on Whisper decoder layers to preserve pretrained acoustics.'
    ],
    evaluatedAt: '2026-10-25 09:10 AM',
    vramRequired: '11.5 GB',
    cloudEstimate: '$35 / month'
  }
];
