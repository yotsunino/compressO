import { Divider } from '@heroui/react'
import { useSnapshot } from 'valtio'

import { appProxy } from '@/routes/(root)/-state'
import { extensions } from '@/types/compression'
import CompressionQuality from './CompressionQuality'
import ImageExtension from './ImageExtension'
import ImageMetadata from './ImageMetadata'
import SvgScaleFactor from './SvgScaleFactor'

type ImageSettingsProps = {
  mediaIndex: number
}

type ImageExtension = keyof typeof extensions.image

function ImageSettings({ mediaIndex }: ImageSettingsProps) {
  const {
    state: { media },
  } = useSnapshot(appProxy)
  const image =
    media.length > 0 && mediaIndex >= 0 && media[mediaIndex].type == 'image'
      ? media[mediaIndex]
      : null

  return (
    <div className="space-y-3 my-3">
      {!(['svg'] as ImageExtension[]).includes(
        image?.extension as ImageExtension,
      ) ? (
        <div>
          <CompressionQuality mediaIndex={mediaIndex} />
          <Divider className="my-3" />
        </div>
      ) : null}

      {(['svg'] as ImageExtension[]).includes(
        image?.extension as ImageExtension,
      ) &&
      (['png', 'jpg', 'jpeg', 'webp'] as ImageExtension[]).includes(
        image?.config?.convertToExtension as ImageExtension,
      ) ? (
        <div>
          <SvgScaleFactor mediaIndex={mediaIndex} />
          <Divider className="my-3 !mt-6" />
        </div>
      ) : null}

      {!(['gif', 'svg'] as ImageExtension[]).includes(
        image?.extension as ImageExtension,
      ) ? (
        <div>
          <ImageMetadata mediaIndex={mediaIndex} />
          <Divider className="my-3" />
        </div>
      ) : null}

      {!(['gif'] as ImageExtension[]).includes(
        image?.extension as ImageExtension,
      ) ? (
        <div className="!mt-8">
          <ImageExtension mediaIndex={mediaIndex} />
        </div>
      ) : null}
    </div>
  )
}

export default ImageSettings
