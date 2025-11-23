export const NODE_TYPES = {
  START: 'start',
  REGULAR: 'regular',
  CAPSTONE: 'capstone',
} as const

export const SKILL_TYPES = {
  START: 'Skill Tree Start',
  REGULAR: 'Regular Skill',
  CAPSTONE: 'Capstone Skill',
} as const

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES]
export type SkillTypeName = (typeof SKILL_TYPES)[keyof typeof SKILL_TYPES]

// Helper to map Drag/Flow Type -> Human Readable Name
export const getSkillLabelFromType = (type: string): SkillTypeName => {
  switch (type) {
    case NODE_TYPES.START:
    case 'input':
      return SKILL_TYPES.START
    case NODE_TYPES.CAPSTONE:
    case 'output':
      return SKILL_TYPES.CAPSTONE
    default:
      return SKILL_TYPES.REGULAR
  }
}

// Helper to map Drag Type -> VueFlow Node Type
export const getFlowTypeFromDragType = (type: string): NodeType => {
  if (type === 'input' || type === NODE_TYPES.START) return NODE_TYPES.START
  if (type === 'output' || type === NODE_TYPES.CAPSTONE) return NODE_TYPES.CAPSTONE
  return NODE_TYPES.REGULAR
}
