import { ProjectServer } from './project';
import { GetConstructorParameter, isSubpath } from '@mdx/utils';

export class ProjectController {
  private _data: ProjectServer[] = [];

  create(...args: GetConstructorParameter<typeof ProjectServer>) {
    const project = new ProjectServer(...args);
    this._data.push(project);
    return project;
  }
  delete(uri: string) {
    for (let i = 0; i < this._data.length; i++) {
      const project = this._data[i];

      if (project.root === uri) {
        project.dispose();
        this._data.splice(i, 1);
        return true;
      }
    }

    return false;
  }
  find(uri: string) {
    return this._data.find((item) => isSubpath(item.root, uri));
  }
}
