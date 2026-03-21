import { useCallback } from 'react'
import { useSnapshot } from 'valtio'

import Slider from '@/components/Slider'
import { appProxy, normalizeBatchMediaConfig } from '@/routes/(root)/-state'

type SvgScaleFactorProps = {
  mediaIndex: number
}

const SVG_SCALE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const
const DEFAULT_SCALE_FACTOR = 4

const SvgScaleFactor = ({ mediaIndex }: SvgScaleFactorProps) => {
  const {
    state: {
      media,
      commonConfigForBatchCompression,
      isCompressing,
      isProcessCompleted,
      isLoadingMediaFiles,
    },
  } = useSnapshot(appProxy)
  const image =
    media.length > 0 && mediaIndex >= 0 && media[mediaIndex].type === 'image'
      ? media[mediaIndex]
      : null
  const { config } = image ?? {}
  const { svgScaleFactor = DEFAULT_SCALE_FACTOR } =
    config ?? commonConfigForBatchCompression.imageConfig ?? {}

  const handleValueChange = useCallback(
    (value: number) => {
      const scaleFactor = value as (typeof SVG_SCALE_OPTIONS)[number]
      if (
        mediaIndex >= 0 &&
        appProxy.state.media[mediaIndex].type === 'image' &&
        appProxy.state.media[mediaIndex]?.config
      ) {
        appProxy.state.media[mediaIndex].config.svgScaleFactor = scaleFactor
        appProxy.state.media[mediaIndex].isConfigDirty = true
      } else {
        if (appProxy.state.media.length > 1) {
          appProxy.state.commonConfigForBatchCompression.imageConfig.svgScaleFactor =
            scaleFactor
          normalizeBatchMediaConfig()
        }
      }
    },
    [mediaIndex],
  )

  const shouldDisableInput =
    media.length === 0 ||
    isCompressing ||
    isProcessCompleted ||
    isLoadingMediaFiles

  return (
    <Slider
      label="Scale Factor"
      size="lg"
      step={1}
      minValue={1}
      maxValue={8}
      value={svgScaleFactor}
      marks={SVG_SCALE_OPTIONS.map((value) => ({
        value,
        label: `${value}x`,
      }))}
      onChange={(val) => {
        if (!Array.isArray(val)) {
          handleValueChange(val)
        }
      }}
      isDisabled={shouldDisableInput}
      className="w-full"
      classNames={{
        label: 'text-gray-600 dark:text-gray-400 text-sm',
        mark: '!text-xs mt-2',
        value: 'text-xs',
      }}
    />
  )
}

export default SvgScaleFactor
