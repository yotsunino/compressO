import { DateValue } from '@heroui/react'
import { core } from '@tauri-apps/api'
import { open } from '@tauri-apps/plugin-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import cloneDeep from 'lodash/cloneDeep'
import React, { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useSnapshot } from 'valtio'

import Button from '@/components/Button'
import Card from '@/components/Card'
import DatePicker from '@/components/DatePicker'
import Divider from '@/components/Divider'
import Image from '@/components/Image'
import ScrollShadow from '@/components/ScrollShadow'
import Switch from '@/components/Switch'
import TextInput from '@/components/TextInput'
import type { VideoMetadataConfig } from '@/types/app'
import { slideDownTransition } from '@/utils/animation'
import { cn } from '@/utils/tailwind'
import {
  appProxy,
  normalizeBatchVideosConfig,
  videoMetadataConfigInitialState,
} from '../../-state'

type MetadataProps = {
  videoIndex: number
}

const THUMBNAIL_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

function Metadata({ videoIndex }: MetadataProps) {
  const {
    state: {
      videos,
      isCompressing,
      isProcessCompleted,
      commonConfigForBatchCompression,
      isLoadingFiles,
    },
  } = useSnapshot(appProxy)
  const video = videos.length > 0 && videoIndex >= 0 ? videos[videoIndex] : null
  const { config } = video ?? {}
  const { shouldPreserveMetadata, metadataConfig, convertToExtension } =
    config ?? commonConfigForBatchCompression ?? {}

  const debounceRef = useRef<NodeJS.Timeout>()
  const metadataRef = useRef<VideoMetadataConfig | null | undefined>(
    metadataConfig as any,
  )

  React.useEffect(() => {
    ;(metadataRef.current as any) = metadataConfig
  }, [metadataConfig])

  const updateMetadataField = useCallback(
    (field: keyof VideoMetadataConfig, value: string | null | undefined) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        if (videoIndex >= 0 && appProxy.state.videos[videoIndex]?.config) {
          if (!appProxy.state.videos[videoIndex]?.config?.metadataConfig) {
            appProxy.state.videos[videoIndex].config.metadataConfig = cloneDeep(
              videoMetadataConfigInitialState,
            )
          }
          ;(appProxy.state.videos[videoIndex].config.metadataConfig![field] as
            | string
            | null
            | undefined) = value

          if (
            field === 'creationTimeRaw' &&
            appProxy.state.videos[videoIndex]?.config?.metadataConfig
          ) {
            appProxy.state.videos[videoIndex].config.metadataConfig![
              'creationTime'
            ] = (value as any)?.toDate('')?.toISOString()
          }

          appProxy.state.videos[videoIndex].isConfigDirty = true
        } else {
          if (appProxy.state.videos.length > 1) {
            if (
              !appProxy.state?.commonConfigForBatchCompression?.metadataConfig
            ) {
              appProxy.state.commonConfigForBatchCompression.metadataConfig =
                cloneDeep(videoMetadataConfigInitialState)
            }
            ;(appProxy.state.commonConfigForBatchCompression.metadataConfig![
              field
            ] as string | null | undefined) = value
            normalizeBatchVideosConfig()
          }
        }
      }, 300)
    },
    [videoIndex],
  )

  const handleThumbnailSelect = useCallback(async () => {
    try {
      const filePath = await open({
        directory: false,
        multiple: false,
        title: 'Select thumbnail image.',
        filters: [
          {
            name: 'image',
            extensions: THUMBNAIL_EXTENSIONS,
          },
        ],
      })
      if (typeof filePath === 'string') {
        updateMetadataField('thumbnailPath', filePath)
        toast.success('Thumbnail selected successfully')
      }
    } catch (error: any) {
      toast.error(error?.message ?? 'Could not select thumbnail image.')
    }
  }, [updateMetadataField])

  const handleClearThumbnail = useCallback(() => {
    updateMetadataField('thumbnailPath', null)
  }, [updateMetadataField])

  const handlePreserveMetadataToggle = useCallback(() => {
    if (videoIndex >= 0 && appProxy.state.videos[videoIndex]?.config) {
      appProxy.state.videos[videoIndex].config.shouldPreserveMetadata =
        !appProxy.state.videos[videoIndex].config.shouldPreserveMetadata
      appProxy.state.videos[videoIndex].isConfigDirty = true

      if (appProxy.state.videos[videoIndex].config.shouldPreserveMetadata) {
        appProxy.state.videos[videoIndex].config.metadataConfig = null
      } else {
        appProxy.state.videos[videoIndex].config.metadataConfig = cloneDeep(
          videoMetadataConfigInitialState,
        )
      }
    } else {
      if (appProxy.state.videos.length > 1) {
        appProxy.state.commonConfigForBatchCompression.shouldPreserveMetadata =
          !appProxy.state.commonConfigForBatchCompression.shouldPreserveMetadata

        if (
          appProxy.state.commonConfigForBatchCompression.shouldPreserveMetadata
        ) {
          appProxy.state.commonConfigForBatchCompression.metadataConfig = null
        } else {
          appProxy.state.commonConfigForBatchCompression.metadataConfig =
            cloneDeep(videoMetadataConfigInitialState)
        }

        normalizeBatchVideosConfig()
      }
    }
  }, [videoIndex])

  const shouldDisableInput =
    videos.length === 0 || isCompressing || isProcessCompleted || isLoadingFiles

  const thumbnailFileName = metadataConfig?.thumbnailPath
    ? metadataConfig.thumbnailPath.split(/[/\\]/).pop()
    : null

  return (
    <ScrollShadow className="max-h-[75vh]" hideScrollBar>
      <Switch
        isSelected={shouldPreserveMetadata}
        onValueChange={handlePreserveMetadataToggle}
        isDisabled={shouldDisableInput}
      >
        <div className="flex justify-center items-center">
          <span className="text-gray-600 dark:text-gray-400 block mr-2 text-sm">
            Preserve Metadata
          </span>
        </div>
      </Switch>
      <AnimatePresence mode="wait">
        {!shouldPreserveMetadata ? (
          <Card className="px-2 my-2 pb-4">
            <motion.div {...slideDownTransition} className="space-y-4 mt-2">
              <div>
                <TextInput
                  type="text"
                  label="Title"
                  placeholder="Enter video title"
                  defaultValue={metadataConfig?.title ?? ''}
                  isDisabled={shouldDisableInput}
                  onValueChange={(value) => updateMetadataField('title', value)}
                  classNames={{ mainWrapper: 'my-3' }}
                />
                <Divider className="mb-6" />
              </div>
              <div>
                <TextInput
                  type="text"
                  label="Artist"
                  placeholder="Enter artist name"
                  defaultValue={metadataConfig?.artist ?? ''}
                  isDisabled={shouldDisableInput}
                  onValueChange={(value) =>
                    updateMetadataField('artist', value)
                  }
                  classNames={{ mainWrapper: 'my-3' }}
                />
                <Divider className="mb-6" />
              </div>
              <div>
                <TextInput
                  type="text"
                  label="Album"
                  placeholder="Enter album name"
                  defaultValue={metadataConfig?.album ?? ''}
                  isDisabled={shouldDisableInput}
                  onValueChange={(value) => updateMetadataField('album', value)}
                  classNames={{ mainWrapper: 'my-3' }}
                />
                <Divider className="mb-6" />
              </div>
              <div>
                <TextInput
                  type="text"
                  label="Year/Date"
                  placeholder="Enter year or date"
                  defaultValue={metadataConfig?.year ?? ''}
                  isDisabled={shouldDisableInput}
                  classNames={{ mainWrapper: 'my-3' }}
                  onValueChange={(value) => updateMetadataField('year', value)}
                />
                <Divider className="mb-6" />
              </div>
              <div>
                <TextInput
                  type="text"
                  label="Comment/Description"
                  placeholder="Enter comment or description"
                  defaultValue={metadataConfig?.comment ?? ''}
                  isDisabled={shouldDisableInput}
                  classNames={{ mainWrapper: 'my-3' }}
                  onValueChange={(value) =>
                    updateMetadataField('comment', value)
                  }
                />
                <Divider className="mb-6" />
              </div>
              <div>
                <TextInput
                  type="text"
                  label="Genre"
                  placeholder="Enter genre"
                  defaultValue={metadataConfig?.genre ?? ''}
                  isDisabled={shouldDisableInput}
                  classNames={{ mainWrapper: 'my-3' }}
                  onValueChange={(value) => updateMetadataField('genre', value)}
                />
                <Divider className="mb-6" />
              </div>
              <div>
                <div className="flex items-center mt-[-10px]">
                  <Switch
                    isSelected={Boolean(
                      metadataConfig?.shouldEnableCreationTime,
                    )}
                    onValueChange={(isSelected) => {
                      updateMetadataField(
                        'shouldEnableCreationTime',
                        isSelected as any,
                      )
                    }}
                    className="flex justify-center items-center"
                    isDisabled={shouldDisableInput}
                    size="sm"
                  >
                    <div className="flex justify-center items-center">
                      <span className="text-black1 dark:text-white1 block mr-2 text-xs opacity-90">
                        Creation Time
                      </span>
                    </div>
                  </Switch>
                </div>
                {metadataConfig?.shouldEnableCreationTime &&
                metadataConfig?.creationTimeRaw ? (
                  <DatePicker
                    hideTimeZone
                    showMonthAndYearPickers
                    label=""
                    placeholder="Enter creation time"
                    isDisabled={
                      shouldDisableInput ||
                      !metadataConfig?.shouldEnableCreationTime
                    }
                    onChange={(value) => {
                      updateMetadataField('creationTimeRaw', value as any)
                    }}
                    defaultValue={metadataConfig?.creationTimeRaw as DateValue}
                    value={metadataConfig?.creationTimeRaw as DateValue}
                    className="mt-2"
                  />
                ) : null}
                <Divider className="mt-3 mb-6" />
              </div>
              <div>
                <TextInput
                  type="text"
                  label="Custom Thumbnail"
                  placeholder="No thumbnail selected"
                  value={thumbnailFileName ?? 'No thumbnail selected'}
                  isDisabled={
                    shouldDisableInput || convertToExtension === 'webm'
                  }
                  isReadOnly
                  classNames={{
                    input: 'text-xs',
                    mainWrapper: 'my-3',
                  }}
                />
                {metadataConfig?.thumbnailPath ? (
                  <div
                    className={cn(
                      'flex justify-center items-center w-full',
                      shouldDisableInput || convertToExtension === 'webm'
                        ? 'opacity-50'
                        : '',
                    )}
                  >
                    <Image
                      alt="custom thumbnail"
                      src={core.convertFileSrc(metadataConfig.thumbnailPath)}
                      className={
                        'max-w-[200px] max-h-[200px] mx-auto object-contain mb-4'
                      }
                    />
                  </div>
                ) : null}
                <div>
                  {!thumbnailFileName ? (
                    <Button
                      type="button"
                      onPress={handleThumbnailSelect}
                      fullWidth
                      size="sm"
                      isDisabled={
                        shouldDisableInput || convertToExtension === 'webm'
                      }
                    >
                      Choose
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onPress={handleClearThumbnail}
                      fullWidth
                      size="sm"
                      isDisabled={
                        shouldDisableInput || convertToExtension === 'webm'
                      }
                      color="danger"
                    >
                      Clear
                    </Button>
                  )}
                  {convertToExtension === 'webm' ? (
                    <p className="text-xs italic text-danger-300 mt-2">
                      webm does not support custom thumbnail
                    </p>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </motion.div>
          </Card>
        ) : null}
      </AnimatePresence>
    </ScrollShadow>
  )
}

export default Metadata
