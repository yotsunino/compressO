import compressoLogo from '../assets/compresso.png'
import { TextBlurIn } from './effects/TextBlurIn'
import { TextFade } from './effects/TextFade'
import { ZoomInBounce } from './effects/ZoomInBounce'

function HeroAnimatedContent() {
  return (
    <>
      <ZoomInBounce>
        <img
          src={compressoLogo.src}
          alt="Compresso Logo"
          className="w-30 h-auto block  mx-auto!"
        />
      </ZoomInBounce>
      <TextBlurIn className="badge">✨ 100% Free & Open Source</TextBlurIn>
      <TextFade direction="down">
        <h1>
          Compress any video
          <br />
        </h1>
        <p className="gradient-text title mb-5!">Completely private</p>
      </TextFade>
    </>
  )
}

export default HeroAnimatedContent
