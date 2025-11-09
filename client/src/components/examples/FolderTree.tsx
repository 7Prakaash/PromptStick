import { useState } from 'react';
import FolderTree from '../FolderTree';

export default function FolderTreeExample() {
  const [selected, setSelected] = useState<string | undefined>();

  return (
    <div className="p-8 max-w-xs">
      <FolderTree
        onSelectFolder={setSelected}
        selectedFolderId={selected}
      />
    </div>
  );
}
