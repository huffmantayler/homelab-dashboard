import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grid, Box } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';

interface GridSizeProps {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
}

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    isEditMode: boolean;
    gridSize: GridSizeProps;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children, isEditMode, gridSize }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        height: '100%',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Grid size={gridSize} ref={setNodeRef} style={style}>
            <Box sx={{ position: 'relative', height: '100%' }}>
                {isEditMode && (
                    <Box
                        {...attributes}
                        {...listeners}
                        sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            zIndex: 10,
                            cursor: 'grab',
                            backgroundColor: 'background.paper',
                            borderRadius: '50%',
                            boxShadow: 2,
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:active': { cursor: 'grabbing' }
                        }}
                    >
                        <DragIndicator fontSize="small" color="action" />
                    </Box>
                )}
                {children}
            </Box>
        </Grid>
    );
};
