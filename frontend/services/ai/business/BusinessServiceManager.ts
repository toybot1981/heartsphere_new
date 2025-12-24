/**
 * 业务服务管理器
 * 统一管理所有业务服务实例
 */

import { AIService } from '../AIService';
import {
  CharacterBusinessService,
  SceneBusinessService,
  DialogueBusinessService,
  JournalBusinessService,
  LetterBusinessService,
  MediaBusinessService,
  StoryBusinessService,
} from './index';

/**
 * 业务服务管理器
 */
export class BusinessServiceManager {
  public readonly character: CharacterBusinessService;
  public readonly scene: SceneBusinessService;
  public readonly dialogue: DialogueBusinessService;
  public readonly journal: JournalBusinessService;
  public readonly letter: LetterBusinessService;
  public readonly media: MediaBusinessService;
  public readonly story: StoryBusinessService;

  constructor(aiService: AIService) {
    this.character = new CharacterBusinessService(aiService);
    this.scene = new SceneBusinessService(aiService);
    this.dialogue = new DialogueBusinessService(aiService);
    this.journal = new JournalBusinessService(aiService);
    this.letter = new LetterBusinessService(aiService);
    this.media = new MediaBusinessService(aiService);
    this.story = new StoryBusinessService(aiService);
  }
}

