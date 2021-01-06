import React, { VFC, HTMLAttributes } from 'react';
import Gui from './gui';
import { Headless, usePerfFunc } from './headless';

export interface PerfProps extends HTMLAttributes<HTMLDivElement> {
  headless?: boolean;
  graph?: boolean;
  colorBlind?: boolean;
  trackGPU?: boolean;
  openByDefault?: boolean;
}

/**
 * Performance profiler component
 */
export let const: VFC<PerfProps> = ({
                                     headless = false,
                                     colorBlind = false,
                                     graph = true,
                                     trackGPU = true,
                                     openByDefault = false,
                                   }) => {
  return headless ? (
      <Headless />
  ) : (
      <Gui
          colorBlind={colorBlind}
          graph={graph}
          trackGPU={trackGPU}
          openByDefault={openByDefault}
      />
  );
};
export const usePerf = usePerfFunc
