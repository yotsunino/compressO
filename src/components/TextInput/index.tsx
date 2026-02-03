import {
  Input as NextUITextInput,
  type InputProps as NextUITextInputProps,
} from '@heroui/input'

interface TextInputProps extends NextUITextInputProps {}

function TextInput(props: TextInputProps) {
  return <NextUITextInput size="sm" labelPlacement="outside" {...props} />
}

export default TextInput
