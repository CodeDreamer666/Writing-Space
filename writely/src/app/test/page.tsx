import { shift, flip, offset } from '@floating-ui/react'
import { FloatingElement } from '@/components/tiptap-ui-utils/floating-element'

export default function FloatingToolbar({ editor }) {
    return (
        <FloatingElement
            editor={editor}
            floatingOptions={{
                placement: 'top',
                middleware: [shift(), flip(), offset(8)],
            }}
        >
            {/* Floating content here */}
        </FloatingElement>
    )
}