export const LOFI_AUDIO_PROFILE = {
  lowpassFrequency: 5200,
  lowpassQ: 0.55,
  compressorThreshold: -22,
  compressorKnee: 18,
  compressorRatio: 3.2,
  compressorAttack: 0.012,
  compressorRelease: 0.18,
  gain: 0.92,
} as const;

export function configureLofiGraph(
  lowpass: BiquadFilterNode,
  compressor: DynamicsCompressorNode,
  gain: GainNode,
) {
  lowpass.type = "lowpass";
  lowpass.frequency.value = LOFI_AUDIO_PROFILE.lowpassFrequency;
  lowpass.Q.value = LOFI_AUDIO_PROFILE.lowpassQ;
  compressor.threshold.value = LOFI_AUDIO_PROFILE.compressorThreshold;
  compressor.knee.value = LOFI_AUDIO_PROFILE.compressorKnee;
  compressor.ratio.value = LOFI_AUDIO_PROFILE.compressorRatio;
  compressor.attack.value = LOFI_AUDIO_PROFILE.compressorAttack;
  compressor.release.value = LOFI_AUDIO_PROFILE.compressorRelease;
  gain.gain.value = LOFI_AUDIO_PROFILE.gain;
}
