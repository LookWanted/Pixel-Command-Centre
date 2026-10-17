import { SimConfig, EpisodeResult } from './types';
import { runEpisode } from './world';

export type WorkerMessage =
  | {
      type: 'START_TRAIN';
      episodesCount: number;
      config: SimConfig;
      initialKnowledge: number;
      startEpisodeNum: number;
    }
  | {
      type: 'START_AB_COMPARE';
      episodesCount: number;
      config: SimConfig;
    };

export type WorkerResponse =
  | {
      type: 'TRAIN_PROGRESS';
      currentEpisode: number;
      totalEpisodes: number;
      percent: number;
      latestResult: EpisodeResult;
    }
  | {
      type: 'TRAIN_COMPLETE';
      results: EpisodeResult[];
      finalKnowledge: number;
    }
  | {
      type: 'AB_PROGRESS';
      phase: 'hive_on' | 'hive_off';
      currentEpisode: number;
      totalEpisodes: number;
      percent: number;
    }
  | {
      type: 'AB_COMPLETE';
      hiveOnResults: EpisodeResult[];
      hiveOffResults: EpisodeResult[];
    };

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  if (msg.type === 'START_TRAIN') {
    const { episodesCount, config, initialKnowledge, startEpisodeNum } = msg;
    const results: EpisodeResult[] = [];
    let currentKnowledge = initialKnowledge;

    for (let i = 0; i < episodesCount; i++) {
      const epNum = startEpisodeNum + i;
      const seed = 1000 + epNum * 77;
      const { result, finalKnowledge } = runEpisode(config, currentKnowledge, epNum, seed);

      if (config.hiveMode) {
        currentKnowledge = finalKnowledge;
      }
      results.push(result);

      // Post progress every episode or every few episodes
      const percent = Math.round(((i + 1) / episodesCount) * 100);
      self.postMessage({
        type: 'TRAIN_PROGRESS',
        currentEpisode: i + 1,
        totalEpisodes: episodesCount,
        percent,
        latestResult: result
      } as WorkerResponse);
    }

    self.postMessage({
      type: 'TRAIN_COMPLETE',
      results,
      finalKnowledge: currentKnowledge
    } as WorkerResponse);
  } else if (msg.type === 'START_AB_COMPARE') {
    const { episodesCount, config } = msg;

    // Run 1: Hive ON
    const hiveOnResults: EpisodeResult[] = [];
    let hiveOnKnowledge = 0;
    const configOn: SimConfig = { ...config, hiveMode: true };

    for (let i = 0; i < episodesCount; i++) {
      const seed = 5000 + i * 31;
      const { result, finalKnowledge } = runEpisode(configOn, hiveOnKnowledge, i + 1, seed);
      hiveOnKnowledge = finalKnowledge;
      hiveOnResults.push(result);

      if ((i + 1) % 5 === 0 || i === episodesCount - 1) {
        self.postMessage({
          type: 'AB_PROGRESS',
          phase: 'hive_on',
          currentEpisode: i + 1,
          totalEpisodes: episodesCount,
          percent: Math.round(((i + 1) / (episodesCount * 2)) * 100)
        } as WorkerResponse);
      }
    }

    // Run 2: Hive OFF (each episode or individual units have no shared knowledge benefit)
    const hiveOffResults: EpisodeResult[] = [];
    const configOff: SimConfig = { ...config, hiveMode: false };

    for (let i = 0; i < episodesCount; i++) {
      const seed = 5000 + i * 31; // identical seed sequence for fair A/B comparison!
      const { result } = runEpisode(configOff, 0, i + 1, seed);
      hiveOffResults.push(result);

      if ((i + 1) % 5 === 0 || i === episodesCount - 1) {
        self.postMessage({
          type: 'AB_PROGRESS',
          phase: 'hive_off',
          currentEpisode: i + 1,
          totalEpisodes: episodesCount,
          percent: Math.round(((episodesCount + i + 1) / (episodesCount * 2)) * 100)
        } as WorkerResponse);
      }
    }

    self.postMessage({
      type: 'AB_COMPLETE',
      hiveOnResults,
      hiveOffResults
    } as WorkerResponse);
  }
};
