import React, { memo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import RenderHtml from 'react-native-render-html';

interface Props {
    html: string;
}

const HTMLContent = ({ html }: Props) => {
    const { width } = useWindowDimensions();
    const theme = useTheme();

    const contentWidth = width - 64;

    const tagsStyles = {
        body: {
            color: theme.colors.onSurface,
            fontSize: 14,
        },
        a: {
            color: theme.colors.primary,
            textDecorationLine: 'none',
        },
        img: {
            maxWidth: contentWidth,
            height: 'auto',
            borderRadius: 8,
            marginVertical: 4,
            alignSelf: 'center',
        },
        blockquote: {
            backgroundColor: theme.colors.surfaceVariant,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
            padding: 8,
            marginVertical: 4,
        }
    };

    const classesStyles = {
        quote: {
            backgroundColor: theme.colors.elevation.level2,
            borderLeftWidth: 3,
            borderLeftColor: theme.colors.tertiary,
            padding: 8,
            marginVertical: 6,
            borderRadius: 4,
        },
        author: {
            fontWeight: 'bold',
            marginBottom: 4,
            color: theme.colors.tertiary,
        },
        signature: {
            fontSize: 12,
            color: theme.colors.onSurfaceDisabled,
            marginTop: 10,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outlineVariant,
            paddingTop: 4
        }
    };

    return (
        <RenderHtml
            contentWidth={contentWidth}
            source={{ html }}
            tagsStyles={tagsStyles as any}
            classesStyles={classesStyles as any}
            baseStyle={{ color: theme.colors.onSurface }}
            computeEmbeddedMaxWidth={() => contentWidth}
        />
    );
};

export default memo(HTMLContent);
